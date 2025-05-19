import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../users/users.entity';

@Entity({ name: 'quests' })
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();
  @Column({ type: 'varchar', length: 100, nullable: false })
  patientName: string;
  @Column({ type: 'varchar', length: 20, nullable: false })
  patientDni: string;
  @Column({ type: 'varchar', length: 50, nullable: false })
  pdfName: string;
  @Column({ type: 'nvarchar', length: 'max', nullable: false })
  jsonQuest: string;
  // atributos de seguridad
  @Column({ type: 'datetime', nullable: false })
  createAt: Date;
  @Column({ type: 'varchar', nullable: true }) // por payload
  createdBy: string; // aca se va guardar el nombre del usuario
  @Column({ type: 'datetime', nullable: false }) //
  updateAt: Date;
  @Column({ type: 'varchar', nullable: true }) // por payload
  updatedBy: string;

  @Column({ type: 'varchar', length: 1, nullable: false })
  questType: string;
  // atributo de estado
  @Column({ type: 'varchar', length: 2, default: 'ac', nullable: false }) // por defecto
  status: string;

  @Column({ type: 'int', nullable: true }) 
  version: number;

  @ManyToOne(() => User, (user) => user.quests) //
  user: User;
}
