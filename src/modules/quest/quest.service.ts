import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';
import { UpdateQuestDto } from './dtos/updateQuest.dto';
import { UpdateStatus } from '../users/dtos/UpdateStatus.dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createQuest(quest: CreateQuestDto, userId: string, now: Date) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new BadRequestException('Usuario no existe!!');

      const questType = await this.catalogsRepository.findOne({
        where: { id: quest.questType },
      });
      if (!questType)
        throw new BadRequestException('Tipo de cuestionario no existe!!');

      const newQuest = this.questsRepository.create({
        ...quest,
        createAt: now,
        createdBy: user.username,
        updateAt: now,
        updatedBy: user.username,
        user: user, // referencia al usuario que creo el cuestionario
      });
      console.log('antes de ejecutar el save quest');
      return await this.questsRepository.save(newQuest);
    } catch (error) {
      console.log('entro al error');

      console.error('Entró al catch:', error);
      throw error;
    }
  }

  async getAllQuests(
    page: number,
    limit: number,
    doctorName: string,
    patientName: string,
    patientDni: string,
  ) {
    const query = this.questsRepository
      .createQueryBuilder('quest')
      .leftJoin('quest.user', 'user') // Unimos la tabla 'user'
      .select([
        'quest.id',
        'quest.questType',
        'quest.patientName',
        'quest.patientDni',
        'quest.pdfName',
        'quest.jsonQuest',
        'quest.updateAt',
        'quest.updatebBy',
        'user.id',
        'user.names',
        'user.patSurname',
        'user.matSurname',
      ]); // Solo selecciona estos c

    if (doctorName) {
      query.andWhere(
        "CONCAT(user.names, ' ', user.patSurname, ' ', user.matSurname) LIKE :doctorName",
        { doctorName: `%${doctorName}%` },
      );
    }
    // TRIM quita espacios al inicio y al final
    if (patientName) {
      query.andWhere('TRIM(quest.patientName) LIKE :patientName', {
        patientName: `%${patientName}%`,
      });
    }

    if (patientDni) {
      query.andWhere('quest.patientDni = :patientDni', { patientDni });
    }

    // Evitar error en SQL Server: Agregar un ORDER BY obligatorio
    query.orderBy('quest.updateAt', 'DESC'); // Cambia 'id' por la columna correcta

    query.skip((page - 1) * limit).take(limit);

    return query.getMany();
  }
  //return this.questsRepository.find({ take: limit, skip: skip });
  //aqui va la fucion actualizar

  async updateQuest(
    questId: string,
    updateData: UpdateQuestDto,
    userId: string,
    now: Date,
  ) {
    // 1. Buscar la Quest existente
    const quest = await this.questsRepository.findOne({
      where: { id: questId },
    });
    if (!quest) {
      throw new Error('cuestionario no encontrado');
    }
    console.log(updateData);
    // 2. Buscar el usuario que realiza la actualización
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('usuario no encontrado');
    }

    // 3. Actualizar la Quest con los nuevos datos
    Object.assign(quest, updateData);

    quest.updateAt = now;
    quest.updatedBy = user.username;
    // {
    //   jsonQuest: JSON.stringify(questData),
    //   updateAt: now,
    //   updatedBy: user.username,
    //});
    console.log(quest.createdBy);
    return this.questsRepository.save(quest);
  }

  async getQuestsPaginated(
    page: number = 1, // Página por defecto 1
    limit: number = 10, // 10 registros por defecto
    filters?: {
      questType?: string;
      doctorName?: string;
      patientName?: string;
      patientDni?: string;
    },
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = this.questsRepository
      .createQueryBuilder('quest')
      .leftJoin('quest.user', 'user') // Unimos la tabla 'user'
      .select([
        'quest.id',
        'quest.questType',
        'quest.patientName',
        'quest.patientDni',
        'quest.pdfName',
        'quest.jsonQuest',
        'quest.createAt',
        'quest.updateAt',
        'user.id',
        'user.names',
        'user.patSurname',
        'user.matSurname',
      ]);

    if (filters) {
      if (filters.questType) {
        query.andWhere('(quest.questType) = :questType', {
          questType: filters.questType,
        });
      }

      if (filters.patientName) {
        query.andWhere('LOWER(quest.patientName) LIKE :patientName', {
          patientName: `%${filters.patientName.toLowerCase()}%`,
        });
      }
      if (filters.patientDni) {
        query.andWhere('LOWER(quest.patientDni) LIKE :patientDni', {
          patientDni: `%${filters.patientDni.toLowerCase()}%`,
        });
      }

      if (filters.doctorName) {
        query.andWhere(
          "LOWER(CONCAT(user.names, ' ', user.patSurname, ' ', user.matSurname)) LIKE :doctorName",
          { doctorName: `%${filters.doctorName.toLowerCase()}%` },
        );
      }
    }
    query.orderBy(`quest.${'createAt'}`, order);
    query.skip((page - 1) * limit).take(limit);
    const [quests, total] = await query.getManyAndCount();

    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuests: total,
      quests,
    };
  }

  async getQuestById(id: string) {
    // const quest = await this.questsRepository.findOne({
    //   where: { id },
    //  });
    //if (!quest) throw new BadRequestException('Cuestionario no encontrado');

    const quest = await this.questsRepository
      .createQueryBuilder('quest')
      .leftJoin('quest.user', 'user') // Hacer el JOIN sin seleccionar todos los campos
      .addSelect('user.id') // Seleccionar solo user.id
      .where('quest.id = :id', { id })
      .getOne();

    if (!quest) throw new BadRequestException('Cuestionario no encontrado');

    return quest;
  }

  async updateQuestStatus(
    questId: string,
    username: string,
    status: UpdateStatus,
    now: Date,
  ) {
    const quest = await this.questsRepository.findOne({
      where: { id: questId },
    });
    if (!quest) {
      throw new BadRequestException('Cuestionario no encontrado');
    }
    if (quest.status === status.status) {
      throw new BadRequestException(
        `El cuestionario ya está en estado "${status.status}"`,
      );
    }
    quest.status = status.status;
    quest.updateAt = now;
    quest.updatedBy = username;
    await this.questsRepository.save(quest);
    return {
      message: `Cuestionario ${status.status === 'ac' ? 'activado' : 'anulado'} correctamente`,
      questId: quest.id,
      status: quest.status,
      updatedAt: quest.updateAt,
      updatedBy: quest.updatedBy,
    };
  }
}
