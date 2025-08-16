import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  //NotFoundException,
} from '@nestjs/common';
//import { UsersRepository } from 'src/Users/users.repository';
import * as bcrypt from 'bcrypt';

//import { Users } from 'src/Users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoguinUserDto } from '../users/dtos/loguinUser.dto';
import { MfaUser } from '../users/dtos/mfaUser.dto';
import { MfaAuthenticationService } from './mfa-authentication.service';
import { LoguinResponse } from '../users/dtos/loguinResponse.dto';
import { UpdatePassword } from '../users/dtos/updatePassword.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,  
    private readonly jwtService: JwtService,  
    private readonly mfaAuthenticationService: MfaAuthenticationService,
  ) {}

  private blacklist: Set<string> = new Set();

  async signIn(credentialsData: LoguinUserDto, now: Date) {
    const response = new LoguinResponse();
     const { username, password, mfaCode } = credentialsData || {};
     if (!username || !password) return 'Usuario y contraseña es requerido';
     const user = await this.usersRepository.findOne({
      where: { username },
     });
     if (!user) throw new BadRequestException('Credencial invalida!!');
    if(user.status=="in") {
      throw new BadRequestException('El usuario esta inactivo');
    }
    await this.validateMFA(user, mfaCode);
     this.validatePasswordExpiration(user, now);
     if (
      user.failedLoginAttempts >= 3 &&
      this.isSameDay(user.lastFailedLogin, now)
    ) {
      user.status = 'bl';
      await this.usersRepository.save(user);
      throw new ForbiddenException('Cuenta bloqueada');
    }

     const isMatch = await bcrypt.compare(password, user.password);

     if (!isMatch) {
      user.failedLoginAttempts = this.isSameDay(user.lastFailedLogin, now)
        ? user.failedLoginAttempts + 1
        : 1;
      user.lastFailedLogin = now;
      await this.usersRepository.save(user);
      throw new BadRequestException('Credencial inválida');
    }

     user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    user.lastLogin = new Date();
    user.updatedBy = user.username;
    await this.usersRepository.save(user);
    if (user.isMfaEnabled && !user.isNewUser) {
      if (mfaCode) {
         const payload = {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.codProfile,
        };
        response.token = this.jwtService.sign(payload,{jwtid: uuidv4()});
        response.profileId = user.codProfile;
        response.userId = user.id;
        response.isMfaEnabled = user.isMfaEnabled;
      }
    }

    response.userId = user.id;
    response.isNewUser = user.isNewUser
    response.isMfaEnabled = user.isMfaEnabled

    return response;
  }

  async validateMFA(user: User, mfaCode?: string) {
    if (!user.isMfaEnabled) return;
    if (mfaCode) {
      const isValid = await this.mfaAuthenticationService.verifyCode(
        mfaCode,
        user.mfaSecrect,
      );
      if (!isValid) {
        throw new BadRequestException('Código MFA inválido');
      }
    }
  }

   private validatePasswordExpiration(user: any, now: Date) {
    if (!user.passwordExpirationDate) return;

    const expirationDate = new Date(user.passwordExpirationDate);
    const daysBeforeExpiration = 7;  
    const warningDate = new Date(expirationDate);
    warningDate.setDate(expirationDate.getDate() - daysBeforeExpiration);

    if (expirationDate < now) {
      throw new ForbiddenException(
        'Tu contraseña ha expirado. Debes actualizarla.',
      );
    } else if (now >= warningDate) {
      console.warn('⚠️ Tu contraseña expirará pronto. Considera cambiarla.');
    }
  }

   private isSameDay(date1: Date, date2: Date): boolean {
    return date1?.toDateString() === date2?.toDateString();
  }

  async generateQrCode(dto: MfaUser) {
    const user = await this.usersRepository.findOne({
      where: { id: dto.idUser },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const { secret, uri } =
      await this.mfaAuthenticationService.generateSecretAuthenticator(
        user.username,
      );
    await this.mfaAuthenticationService.enableStatusMfa(dto.idUser, secret);
    return uri;
  }

  async logout(token: string): Promise<string> {
    this.blacklist.add(token); 
    return 'Sesión cerrada exitosamente.';
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

 async updatePassword(request : UpdatePassword) {
  const username = request.user
  console.log(request)
   const user = await this.usersRepository.findOne({
    where: { username },
  });
  if (!user) {
    throw new BadRequestException('Credencial invalida!!');
  }
  if (user.status!='ac') {
    return { message: 'No se puede cambiar la contraseña en este momento' }
  }
  const isMatch = await bcrypt.compare(request.password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts = this.isSameDay(user.lastFailedLogin, new Date())
      ? user.failedLoginAttempts + 1
      : 1;
    user.lastFailedLogin = new Date();
    await this.usersRepository.save(user);
    throw new BadRequestException('Credencial inválida');
  }
  const passwordExpirationDate = new Date();
  passwordExpirationDate.setDate(passwordExpirationDate.getDate() + 90);
  user.password = await bcrypt.hash(request.newPassword, 10);
  user.isNewUser = false
  user.passwordExpirationDate = passwordExpirationDate
  await this.usersRepository.save(user);
  return { message: 'Contraseña actualizada correctamente' }
  }

}
