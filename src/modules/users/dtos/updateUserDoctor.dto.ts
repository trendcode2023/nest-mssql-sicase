import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';

export class UpdateUserByDoctorDto extends PickType(CreateUserDto, [
  'email',
  'password',
  'cmp',
  'cellphone',
  'routeStamp',
]) {}
