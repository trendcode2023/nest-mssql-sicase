import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { CreateUserDto } from './dtos/createUser.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
//import { Role } from 'src/utils/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
//import { Roles } from 'src/decorators/roles.decorator';
//import { Role } from 'src/utils/roles.enum';
//import { ApiBearerAuth } from '@nestjs/swagger';

//import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseInterceptors(DateAdderInterceptor)
  createUser(
    @Body() user: CreateUserDto,
    @Req() request: Request & { now: string },
    // @Req() req: any,
  ) {
    // const loggedInUserDni = String(req.user?.dni);

    const loggedInUserDni = 'hola';
    return this.usersService.createUser(user, request.now, loggedInUserDni);
  }

  @ApiBearerAuth() //  solo para swagger: ruta requiere autenticación basada en Bearer tokens
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('getall')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
