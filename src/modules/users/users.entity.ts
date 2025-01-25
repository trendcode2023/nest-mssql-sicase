import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();
  @Column({ type: 'varchar', length: 2, nullable: false })
  documentType: string;
  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  documentNum: string;
  @Column({ type: 'varchar', length: 10, unique: true, nullable: true }) // nullable true: porque el usuario puede que no sea medico
  cmp: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  names: string;
  @Column({ type: 'varchar', length: 45, nullable: false })
  patSurname: string;
  @Column({ type: 'varchar', length: 45, nullable: false })
  matSurname: string;
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;
  @Column({ type: 'varchar', length: 15, nullable: true })
  cellphone: string;
  @Column({ type: 'varchar', length: 250, nullable: true }) // it is true becuase initialy dont have a stamp
  RouteStamp: string;
  // staus del logueo
  @Column({ type: 'int', default: 1, nullable: false })
  status: number;
  // datos de logueo
  @Column({ type: 'varchar', nullable: false })
  lastLogin: string;
  @Column({ type: 'int', default: 5, nullable: false }) // indicador de cantidad de veces para loguearte // es necesario colocar este parametro??
  availableLoginNumber: number;
  @Column({ type: 'int', default: 0, nullable: false })
  loginNumberUsed: number;

  // usuario y fechas de creacion y modificacion
  @Column({ type: 'varchar', nullable: false })
  createAt: string;
  @Column({ type: 'varchar', nullable: false })
  createdBy: string;
  @Column({ type: 'varchar', nullable: false })
  updateAt: string;
  @Column({ type: 'varchar', nullable: false })
  updatedBy: string;
  // fechas de expiration de usuario y password
  @Column({ type: 'varchar', nullable: false })
  userExpirationDate: string;
  @Column({ type: 'int', default: 1, nullable: false }) // consultar que tipo de dato sera
  userExpirationFlag: number;
  @Column({ type: 'varchar', nullable: false })
  passwordExpirationDate: string;
  @Column({ type: 'int', default: 1, nullable: false })
  passwordExpirationFlag: number;
}
