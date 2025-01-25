import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';

//import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() user: any) {
    console.log('entro');

    return this.usersService.createUser(user, 'hoy');
  }
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
