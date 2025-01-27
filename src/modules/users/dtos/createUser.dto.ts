import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  codprofile?: string;

  /**
   * debe ser un string de 2 caracteres
   * @example '01'
   */

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, { message: 'document type must have 3 characters' })
  documentType: string;

  /**
   * debe ser un string de 8 a 15 caracteres
   * @example '44180518'
   */
  @IsNotEmpty()
  @IsString()
  @Length(8, 15, {
    message: 'document number must be between 8 and 15 characters',
  })
  documentNum: string;

  /**
   * debe ser un string entre 5 y 6 caracteres
   * @example '98628'
   */
  @IsString()
  @Length(5, 6, {
    message: 'CMP must be between 5 and 6 characters',
  })
  cmp: string;

  /**
   * Debe ser un string entre 3 y 100 caracteres
   * @example 'Johan Daniel'
   */
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'names must be between 3 and 100 characters' })
  names: string;

  /**
   * Debe ser un string entre 2 y 45 caracteres
   * @example 'Rocha'
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'paternal surname must be between 2 and 45 characters',
  })
  patSurname: string;

  /**
   * Debe ser un string entre 2 y 45 caracteres
   * @example 'Horna'
   */
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'maternal surname must be between 2 and 45 characters',
  })
  matSurname: string;
  /**
   * Debe tener un formato valido
   * @example 'johan.rocha.horna@gmail.com'
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  email: string;
  /**
   * Debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*), y debe tener entre 8 y 15 caracteres
   * @example 'Rocha2025*'
   */
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message:
      'The password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*), and must be between 8 and 15 characters.',
  })
  password: string;
  /**
   * Debe contener 9 caracteres
   * @example '978803990'
   */
  @IsString()
  @Length(9, 9, {
    message: 'cellphone number must have 9 characters',
  })
  cellphone: string;
  /**
   * Debe contener hasta 250 caracteres
   * @example 'https://example.com'
   */
  @IsString()
  @Length(2, 45, {
    message: 'Route Stamp must be up to 250 characters',
  })
  RouteStamp: string;
}

/*
  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;*/
