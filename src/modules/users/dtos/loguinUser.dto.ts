import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';
import { IsOptional, IsString } from 'class-validator';

export class LoguinUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {
  @IsOptional()
  @IsString()
  mfaCode: string | null; 
}
