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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>, // declaramos el el repositorio
    private readonly jwtService: JwtService, // declaramosn el jwservice
    private readonly mfaAuthenticationService: MfaAuthenticationService,
  ) {}

  async signIn(credentialsData: LoguinUserDto, now: Date) {
    // 1. Destructuring del objeto y previene error si el objeto es null o undefined
    const { email, password, mfaCode } = credentialsData || {};
    // 2. valida si existe email y password no son vacios
    if (!email || !password) return 'email y password es requerido!!';
    // 3. busca usuario por email y lo asigna a user
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (user.isMfaEnabled) {
      const isValid = await this.mfaAuthenticationService.verifyCode(
        mfaCode,
        user.mfaSecrect,
      );
      if (!isValid) {
        throw new BadRequestException('Codigo incorrecto');
      }
    }
    // 4. valida si user es vacio
    if (!user) throw new BadRequestException('Credencial invalida!!');
    // 5. Verifica si la contraseña ha expirado
    this.validatePasswordExpiration(user, now);
    /*
    if (
      // verifica si existe user.passwordExpirationDate existe y tiene un valor
      user.passwordExpirationDate &&
      new Date(user.passwordExpirationDate) < now
    ) {
      throw new BadRequestException(
        'Tu contraseña ha expirado. Debes actualizarla.',
      );
    }
    */
    // 6. verifica si el usuario tiene 3 intentos fallidos y lo bloqueamos
    if (
      user.failedLoginAttempts >= 3 &&
      this.isSameDay(user.lastFailedLogin, now)
    ) {
      user.status = 'bl';
      await this.usersRepository.save(user);
      throw new ForbiddenException('Cuenta bloqueada');
    }

    // 7. compara la contrasenia
    const isMatch = await bcrypt.compare(password, user.password);

    // 8. validad si la comparacion fue exitosa
    if (!isMatch) {
      user.failedLoginAttempts = this.isSameDay(user.lastFailedLogin, now)
        ? user.failedLoginAttempts + 1
        : 1;
      user.lastFailedLogin = now;
      await this.usersRepository.save(user);
      throw new BadRequestException('Credencial inválida');
    }

    // 7. Si el inicio de sesión es exitoso, reiniciamos los intentos fallidos
    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    user.lastLogin = new Date();
    await this.usersRepository.save(user);
    // 8. crea el payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.profile.name,
    };
    // 9. generamos el token
    return {
      token: this.jwtService.sign(payload),
      idUser: user.id,
      isMfaEnabled: user.isMfaEnabled,
      // devolver el id del perfil
    };
  }
  // 🔹 Función para validar la expiración de la contraseña
  private validatePasswordExpiration(user: any, now: Date) {
    if (!user.passwordExpirationDate) return;

    const expirationDate = new Date(user.passwordExpirationDate);
    const daysBeforeExpiration = 7; // avsiso con 7 dias de anticipacion a la fecha de expiracion de la contrasenia
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

  // 🔹 Función para verificar si es el mismo día
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
        user.email,
      );
    await this.mfaAuthenticationService.enableStatusMfa(dto.idUser, secret);
    return uri;
  }

  // registro del usuario
}

/*
  if (!isMatch) {
      if (!this.isSameDay) {
        // Si el último intento fallido no es en el mismo día, reiniciar el contador
        user.failedLoginAttempts = 1;
        user.lastFailedLogin = now;
        console.log(now);
      } else {
        user.failedLoginAttempts++;
      }
      const validar = await this.usersRepository.save(user);
      console.log('guardamos en base de datos');
      console.log('verificra si cambia lastFailedLogin');
      console.log(validar.lastFailedLogin + '-' + validar.failedLoginAttempts);

      throw new BadRequestException('Credencial inválida!!');
    }
*/

/*
    const lastFailedLogin = user.lastFailedLogin  ? new Date(user.lastFailedLogin)
      : null; // si user.lastFailedLogin existe lo convertimos a una instancia de Date sino mantine nulo
    console.log(
      'verificamos si lastFailedLogin existe de lo contrario sera nulo',
    );
    console.log('lastFailedLogin: ' + lastFailedLogin);

    const isSameDay =
      lastFailedLogin && lastFailedLogin.toDateString() === now.toDateString();
    console.log(
      'verificamos si lastFailedLogin existe, entonces comparamos con la fecha actual, de lo contrario sera false',
    );
    console.log('isSameDay: ' + isSameDay);
    // hasta ahora no guardamos nada en base de datos
    if (user.failedLoginAttempts >= 3 && isSameDay) {
      // Si el usuario tiene 3 intentos fallidos en el mismo día, bloquear la cuenta
      user.status = 'bl';
      await this.usersRepository.save(user);
      throw new BadRequestException('Cuenta bloqueada');
    }
*/

//    if (!user) return 'Invalid Credentials';
//    if (user.password === password) return 'Logged In';
//    return 'Invalid Credentials';

/*  async signup(user: Partial<User>) {
    const { email, password } = user;
    if (!email || !password) throw new BadRequestException('Data is required');
    const foundUser = await this.usersRepository.findOneBy({ email });
    if (foundUser) throw new BadRequestException('email is registered');

    // proceso de registro
    // hashear la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // guardar el usuario en la bd
    return await this.usersRepository.create({
      ...user,
      password: hashedPassword,
    });
  }*/
