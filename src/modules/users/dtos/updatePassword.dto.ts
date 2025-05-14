import { IsNotEmpty, IsString, Length, maxLength } from "class-validator"

export class UpdatePassword {

    @IsNotEmpty()
    @IsString()
    user: string
    
    @IsNotEmpty()
    @IsString()
    @Length(8, 15, {
        message: 'La contraseña debe tener entre 8 y 15 caracteres',
      })
    password: string

    @IsNotEmpty()
    @IsString()
    @Length(8, 15, {
        message: 'La contraseña debe tener entre 8 y 15 caracteres',
      })
    newPassword: string


}
