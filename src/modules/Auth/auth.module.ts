import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MfaAuthenticationService } from './mfa-authentication.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], //UsersModule
  exports: [],
  controllers: [AuthController],
  providers: [AuthService,MfaAuthenticationService],
})
export class AuthModule {}
