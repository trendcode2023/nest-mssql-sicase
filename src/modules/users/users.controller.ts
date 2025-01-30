import {
  Body,
  Controller,
  Get,
  Param,
  //Param,
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
import { User } from 'src/decorators/user.decorator';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UpdateUserByDoctorDto } from './dtos/updateUserDoctor.dto';
//import { Roles } from 'src/decorators/roles.decorator';
//import { Role } from 'src/utils/roles.enum';
//import { ApiBearerAuth } from '@nestjs/swagger';

//import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(DateAdderInterceptor)
  @Post('create')
  createUser(
    @Body() user: CreateUserDto,
    @Req() request: Request & { now: Date },
    @User('dni') loggedInUserDni: string, // captura los datos del payload
  ) {
    return this.usersService.createUser(user, request.now, loggedInUserDni);
  }

  @ApiBearerAuth() //  solo para swagger: ruta requiere autenticación basada en Bearer tokens
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('getall')
  getAllUsers() {
    /*
acac haria la logia
pregunto a la tabla user profi
*/

    return this.usersService.getAllUsers();
  }

  @Roles('doctor')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(DateAdderInterceptor)
  @Post('update/byDoctor/:id')
  async updateUserByDoctor(
    @Param('id') id: string,
    @Req() request: Request & { now: Date },
    @User('dni') loggedInUserDni: string,
    @Body() updateData: UpdateUserByDoctorDto,
  ) {
    return this.usersService.updateUserByDoctor(
      id,
      updateData,
      request.now,
      loggedInUserDni,
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(DateAdderInterceptor)
  @Post('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Req() request: Request & { now: Date },
    @User('dni') loggedInUserDni: string,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.usersService.updateUser(
      id,
      updateData,
      request.now,
      loggedInUserDni,
    );
  }
}
/*  @Post(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
  */
