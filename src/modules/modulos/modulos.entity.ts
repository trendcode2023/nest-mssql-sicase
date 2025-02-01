import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Route } from '../routes/routes.entity';

@Entity('modulos')
export class Modulo {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 80, nullable: false })
  description: string;

  @Column({ type: 'int', nullable: false })
  order: number;

  @OneToMany(() => Route, (route) => route.modulo)
  routes: Route[];
}
