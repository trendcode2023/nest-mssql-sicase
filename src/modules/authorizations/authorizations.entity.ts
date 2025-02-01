import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Route } from '../routes/routes.entity';
import { Profile } from '../profile/profile.entity';

@Entity('authorizations')
export class Authorization {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 2, nullable: false })
  addOptionFlag: string;

  @Column({ type: 'varchar', length: 2, nullable: false })
  modifyOptionFlag: string;

  @Column({ type: 'varchar', length: 2, nullable: false })
  deleteOptionFlag: string;

  //@OneToMany(() => Route, (route) => route.authorization)
  //routes: Route[];

  @ManyToOne(() => Route, (route) => route.authorizations) // centidad profile
  route: Route;

  @ManyToOne(() => Profile, (profile) => profile.authorizations) // centidad profile
  profile: Profile;
}
