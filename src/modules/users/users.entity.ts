import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Profile } from '../profile/profile.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();
  // pendiente agregar nombre de usuario
  @Column({ type: 'varchar', length: 2, nullable: false })
  documentType: string;
  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  documentNum: string;
  /**
   * debe ser unico
   */
  @Column({ type: 'varchar', length: 10, unique: true, nullable: true }) // nullable true: porque el usuario puede que no sea medico
  cmp: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  names: string;
  @Column({ type: 'varchar', length: 45, nullable: false })
  patSurname: string;
  @Column({ type: 'varchar', length: 45, nullable: false })
  matSurname: string;
  /** debe ser unico */
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  username: string;
  /**
   * debe ser unico
   */
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;
  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;
  @Column({ type: 'varchar', length: 15, nullable: true })
  cellphone: string;
  @Column({ type: 'varchar', length: 250, nullable: true })
  routeStamp: string; // it is true becuase initialy dont have a stamp
  // staus del logueo
  @Column({ type: 'varchar', default: 'ac', nullable: false }) // por defecto
  status: string;
  // datos de logueo
  @Column({ type: 'datetime', nullable: true }) // por defecto
  lastLogin: Date;
  @Column({ type: 'datetime', nullable: true }) // por defecto
  lastFailedLogin: Date;
  @Column({ type: 'int', default: 5, nullable: false }) // por defecto
  availableLoginNumber: number; //
  @Column({ type: 'int', default: 0, nullable: false }) // por defecto
  failedLoginAttempts: number;
  // usuario y fechas de creacion y modificacion
  @Column({ type: 'datetime', nullable: false }) // por defecto
  createAt: Date;
  @Column({ type: 'varchar', nullable: false }) // por payload
  createdBy: string; // aca se va guardar el nombre del usuario
  @Column({ type: 'datetime', nullable: false }) // por defecto
  updateAt: Date;
  @Column({ type: 'varchar', nullable: false }) // por payload
  updatedBy: string;
  // fechas de expiration de usuario y password
  @Column({ type: 'datetime', nullable: false }) // por defecto
  userExpirationDate: Date;
  /**
   * por defecto 1
   */
  @Column({ type: 'int', default: 1, nullable: false }) // por defecto
  userExpirationFlag: number;
  @Column({ type: 'datetime', nullable: false }) //
  passwordExpirationDate: Date;
  @Column({ type: 'int', default: 1, nullable: false }) // por defecto
  passwordExpirationFlag: number;

  @Column({type:'bit', default: false, nullable:false})
  isMfaEnabled: boolean;
  
  @Column({ type: 'varchar', nullable: true })
  mfaSecrect: string;

  @ManyToOne(() => Profile, (profile) => profile.users) // centidad profile
  profile: Profile;
}
