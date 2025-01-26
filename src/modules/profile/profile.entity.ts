import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 3, nullable: false })
  codeName: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({ type: 'int', default: 1 })
  status: number;
}
