import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 2, { message: 'document type must have 3 characters' })
  documentType: string;
  @IsNotEmpty()
  @IsString()
  @Length(8, 15, {
    message: 'document number must be between 8 and 15 characters',
  })
  documentNum: string;
  @IsString()
  @Length(5, 6, {
    message: 'CMP must be between 8 and 15 characters',
  })
  cmp: string;
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'names must be between 3 and 100 characters' })
  names: string;
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'paternal surname must be between 2 and 45 characters',
  })
  patSurname: string;
  @IsNotEmpty()
  @IsString()
  @Length(2, 45, {
    message: 'maternal surname must be between 2 and 45 characters',
  })
  matSurname: string;
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'The email must be in a valid format.' })
  email: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message:
      'The password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*), and must be between 8 and 15 characters.',
  })
  password: string;
  @IsString()
  @Length(9, 9, {
    message: 'cellphone number must have 9 characters',
  })
  cellphone: string;
  @IsString()
  @Length(2, 45, {
    message: 'Route Stamp must be up to 250 characters',
  })
  RouteStamp: string;

  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;
}
