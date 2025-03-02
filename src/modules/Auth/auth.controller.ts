
import { AuthService } from './auth.service';
import { LoguinUserDto } from '../users/dtos/loguinUser.dto';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { MfaUser } from '../users/dtos/mfaUser.dto';
import { LogoutService } from './logout.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, Res, UseInterceptors } from '@nestjs/common';
//import { LoguinUserDto } from '../users/dtos/loguinUser.dto';
//import { AuthService } from './auth.service';

//import { AuthService } from 'src/Auth/auth.service';
//import { LoginUserDto, UserDto } from 'src/Users/user.dto';
//import { AuthService } from './auth.service';
//import { Users } from 'src/Users/user.entity';
@ApiTags('Auth')
//@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,private logoutService: LogoutService) {}

  @UseInterceptors(DateAdderInterceptor)
  @Post('signin')
  signIn(
    @Body() credentials: LoguinUserDto,
    @Req() request: Request & { now: Date },
  ) {
    return this.authService.signIn(credentials, request.now);
  }

  @Post('mfa/generateQr')
  async generateQrCode(@Body() request: MfaUser, @Res() response: Response) {
    const uri = await this.authService.generateQrCode(request);
    response.type("png");
    return toFileStream(response,uri)
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() request: Request) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.split(' ')[1]; 
    if (!token) {
      return { message: 'Token no proporcionado' };
    }
    return this.logoutService.logout(token); 
  }

} 