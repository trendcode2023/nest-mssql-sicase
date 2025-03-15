import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  codProfile: string;

  @Expose()
  documentType: string;

  @Expose()
  documentNum: string;

  @Expose()
  cmp: string;

  @Expose()
  names: string;

  @Expose()
  patSurname: string;

  @Expose()
  matSurname: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  cellphone: string;

  @Expose()
  routeStamp: string;

  // Excluir password para que no se envíe en la respuesta
  @Exclude()
  password?: string;
}
