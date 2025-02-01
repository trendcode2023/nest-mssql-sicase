import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Authorization } from '../authorizations/authorizations.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 3, nullable: false })
  @Index({ unique: true })
  codeName: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({ type: 'int', default: 1 })
  status: number;

  @OneToMany(() => User, (user) => user.profile)
  users: User[];
  @OneToMany(() => Authorization, (authorization) => authorization.route)
  authorizations: Authorization[];
}
