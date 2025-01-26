import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoguinUserDto } from '../users/dtos/loguinUser.dto';
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
  constructor(private authService: AuthService) {}

  @Post('signin')
  signIn(@Body() credentials: LoguinUserDto) {
    console.log('entro sigin');
    const { email, password } = credentials;
    return this.authService.signIn(email, password);
  }

  // para que el mismo usuario se registre
  @Post('signup')
  signup(@Body() user: any) {
    console.log('entro signup');
    return this.authService.signup(user);
  }
  /*
  @Get()
  getAuth() {
    return this.authService.getAuth();
  }*/
}
