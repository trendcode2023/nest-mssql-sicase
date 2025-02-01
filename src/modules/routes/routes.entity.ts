import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Modulo } from '../modulos/modulos.entity';
import { Authorization } from '../authorizations/authorizations.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 25, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 80, nullable: false })
  description: string;

  @Column({ type: 'int', nullable: false })
  order: number;

  @ManyToOne(() => Modulo, (modulo) => modulo.routes) // centidad profile
  modulo: Modulo;

  //@ManyToOne(() => Authorization, (authorization) => authorization.routes) //
  //authorization: Authorization;

  @OneToMany(() => Authorization, (authorization) => authorization.route)
  authorizations: Authorization[];
}
