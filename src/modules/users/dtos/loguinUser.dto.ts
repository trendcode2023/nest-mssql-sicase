import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';
import { IsString } from 'class-validator';

export class LoguinUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {
  @IsString()
  mfaCode:string
}
