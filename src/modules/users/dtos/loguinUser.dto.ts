import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';
import { IsOptional, IsString } from 'class-validator';

export class LoguinUserDto extends PickType(CreateUserDto, ['email']) {
  @IsOptional()
  @IsString()
  mfaCode: string | null;

  /**
   * debe ser un string
   * @example 'Qwerty*2025'
   */
  @IsString()
  password: string;
}
