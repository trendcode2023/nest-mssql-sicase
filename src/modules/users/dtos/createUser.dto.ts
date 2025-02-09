import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  /**
   * debe ser un string de 2 caracteres (02 admin,03 doctor)
   * @example '02'
   */
  @IsString()
  codprofile?: string;

  /**
   * debe ser un string de 2 caracteres
   * @example '01'
   */

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, {
    message: 'El codigo de documento debe tener al menos 2 caracteres',
  })
  documentType: string;

  /**
   * debe ser un string de 8 a 15 caracteres
   * @example '21457869'
   */
  @IsNotEmpty()
  @IsString()
  @Length(8, 15, {
    message: 'El nro de docuemnto debe tener entre 8 y 15 caracteres',
  })
  documentNum: string;

  /**
   * debe ser un string entre 5 y 6 caracteres
   * @example '123456'
   */
  @IsString()
  @Length(5, 6, {
    message: 'CMP debe tener entre 5 y 6 caracteres.',
  })
  cmp: string;

  /**
   * Debe ser un string entre 3 y 100 caracteres
   * @example 'Juan'
   */
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, {
    message: 'Los nombres deben tener entre 3 and 100 caracteres.',
  })
  names: string;

  /**
   * Debe ser un string entre 2 y 45 caracteres
   * @example 'Perez'
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'El apellido paterno debe tener entre 2 and 45 caracteres.',
  })
  patSurname: string;

  /**
   * Debe ser un string entre 2 y 45 caracteres
   * @example 'Diaz'
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'El apellido materno debe tener entre 2 and 45 caracteres.',
  })
  matSurname: string;
  /**
   * Inicial de primer nombre, primer apellido e inicial de segundo apellido
   * @example 'jperezd'
   */
  @IsNotEmpty()
  @IsString()
  @Length(5, 20, {
    message: 'El nombre de usuario dbe tener entre 5 y 20 caracteres',
  })
  username: string;
  /**
   * Debe tener un formato valido
   * @example 'admin@gmail.com'
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'El email debe tener un formato valido' })
  email: string;
  /**
   * Debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*), y debe tener entre 8 y 15 caracteres
   * @example 'Qwerty*2025'
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message:
      'La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*) y debe tener entre 8 y 15 caracteres.',
  })
  password: string;
  /**
   * Debe contener 9 caracteres
   * @example '978803990'
   */
  @IsString()
  @Length(9, 9, {
    message: 'El número de teléfono celular debe tener 9 caracteres.',
  })
  cellphone: string;
  /**
   * Debe contener hasta 250 caracteres
   * @example 'https://example.com'
   */
  @IsString()
  @Length(2, 150, {
    message: 'La ruta del sello debe tener hasta 150 caracteres',
  })
  routeStamp: string;
}

/*
  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;*/
