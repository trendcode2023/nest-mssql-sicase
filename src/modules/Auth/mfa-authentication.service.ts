import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';

@Injectable()
export class MfaAuthenticationService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async generateSecretAuthenticator(email: string) {
    const secret = authenticator.generateSecret();
    const appName = process.env.TFA_APP_NAME;
    console.log(appName, 'appName');

    const uri = authenticator.keyuri(email, appName, secret);
    return { uri, secret };
  }

  async verifyCode(code: string, secret: string) {
    Logger.debug(code, 'CODE');
    Logger.debug(secret, 'secret');
    return authenticator.verify({ token: code, secret });
  }

  async enableStatusMfa(id: string, secret: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.isMfaEnabled = true;
    user.mfaSecrect = secret;

    await this.usersRepository.save(user);
  }
}
