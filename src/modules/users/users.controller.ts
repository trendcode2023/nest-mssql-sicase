import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  //Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { CreateUserDto } from './dtos/createUser.dto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
//import { Role } from 'src/utils/roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { User } from 'src/decorators/user.decorator';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UpdateUserByDoctorDto } from './dtos/updateUserDoctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
//import { Roles } from 'src/decorators/roles.decorator';
//import { Role } from 'src/utils/roles.enum';
//import { ApiBearerAuth } from '@nestjs/swagger';

//import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(DateAdderInterceptor)
  @UseInterceptors(FileInterceptor('file')) // 👈 Captura la imagen
  @Post('create')
  createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() user: CreateUserDto,
    @Req() request: Request & { now: Date },
    @User('username') loggedInUserDni: string, // captura los datos del payload
  ) {
    console.log(loggedInUserDni);
    return this.usersService.createUser(
      user,
      request.now,
      loggedInUserDni,
      //    file,
    );
  }

  @ApiBearerAuth() //  solo para swagger: ruta requiere autenticación basada en Bearer tokens
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('getall')
  getAllUsers() {
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
 // @UseGuards(AuthGuard) // captura el token
  @UseInterceptors(FileInterceptor('file')) // 👈 Captura la imagen
  @UseInterceptors(DateAdderInterceptor)
  @Post('stamp/:id')
  async uploadStamp(
    @Param('id') idUser: string, //id del usuario
    @Req() request: Request & { now: Date }, // fecha del sistema
    //@Body() stampData: CreateUserDto, //
    @UploadedFile() file: Express.Multer.File, //archivo a cargar
    @User('username') loggedInUsername: string, // captura los datos del payload del token
  ) {
    return this.usersService.uploadStamp(
      idUser,
      request.now,
      file,
      loggedInUsername,
    );
  }

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('paginated')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de registros por página' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filtro por nombre' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filtro por email' })
  @ApiQuery({ name: 'documentNum', required: false, type: String, description: 'Filtro por número de documento' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'order', required: false, type: String, description: 'Orden (ASC o DESC)' })
  async getUsersPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('documentNum') documentNum?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.usersService.getUsersPaginated(
      Number(page),
      Number(limit),
      { name, email, documentNum },
      //sortBy as keyof User,
      order,
    );
  }

 // @UseGuards(AuthGuard) 
  @ApiBearerAuth()
  @Get('getUserById/:userId') // Ruta dinámica
  async getUserById(@Param('userId', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.getUserById(id);
  }


}
/*  @Post(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
  */
