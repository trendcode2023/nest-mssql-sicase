import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    
    @IsOptional()
    @IsBoolean()
    resetMfa: boolean = false

    @IsOptional()
    @IsBoolean()
    unlock: boolean = false



}
