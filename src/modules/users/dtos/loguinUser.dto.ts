import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';

export class LoguinUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
