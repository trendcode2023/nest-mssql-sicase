import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('catalogs')
export class Catalog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 3, nullable: false })
  codeName: string;

  @Column({ type: 'varchar', length: 25, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  detail: string;
  /*
  @OneToMany(() => User, (user) => user.catalog)
  users: User[];*/
}
