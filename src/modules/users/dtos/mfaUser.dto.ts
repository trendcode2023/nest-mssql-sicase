import { IsString } from 'class-validator';

export class MfaUser{
  @IsString()
  idUser: string;
}
