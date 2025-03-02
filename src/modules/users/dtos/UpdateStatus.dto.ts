import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUser.dto';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatus {
    
    @ApiProperty({
        example: 'ac',
        description: 'Estado del usuario: "ac" para activar, "in" para anular',
        enum: ['ac', 'in'],
    })
    @IsNotEmpty({ message: 'El estado no puede estar vacío' })
    @IsString({ message: 'El estado debe ser un string' })
    @IsIn(['ac', 'in'], { message: 'El estado solo puede ser "ac" o "in"' })
    status: 'ac' | 'in';
}