import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MfaAuthenticationService } from './mfa-authentication.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LogoutService } from './logout.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], //UsersModule
  exports: [AuthService,MfaAuthenticationService,LogoutService],
  controllers: [AuthController],
  providers: [AuthService,MfaAuthenticationService,LogoutService],
})
export class AuthModule {}
