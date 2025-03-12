import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../users/users.entity';

@Entity({ name: 'quests' })
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();
  @Column({ type: 'varchar', length: 100, nullable: false })
  patientName: string;
  @Column({ type: 'varchar', length: 8, nullable: false })
  patientDni: string;
  @Column({ type: 'varchar', length: 50, nullable: false })
  pdfName: string;
  @Column({ type: 'nvarchar', length: 'max', nullable: false })
  jsonQuest: string;
  // atributos de seguridad
  @Column({ type: 'datetime', nullable: false })
  createAt: Date;
  @Column({ type: 'varchar', nullable: false }) // por payload
  createdBy: string; // aca se va guardar el nombre del usuario
  @Column({ type: 'datetime', nullable: false }) //
  updateAt: Date;
  @Column({ type: 'varchar', nullable: false }) // por payload
  updatedBy: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  questType: string;

  @ManyToOne(() => User, (user) => user.quests) //
  user: User;
}
