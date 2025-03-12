import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';

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
      // return this.questsRepository.save(newQuest);
      /*  return await this.questsRepository.save(newQuest).catch((error) => {
        // console.error('Error en save:', error);
        if (
          error instanceof QueryFailedError &&
          error.message.includes('UNIQUE KEY constraint')
        ) {
          throw new ConflictException(
            `A quest with this unique value already exists.`,
          );
        }
        throw new InternalServerErrorException(
          `Unexpected error: ${error.message}`,
        );
      });*/
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
    questData: Partial<CreateQuestDto>,
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

    // 2. Buscar el usuario que realiza la actualización
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('usuario no encontrado');
    }
    console.log(now);
    // 3. Actualizar la Quest con los nuevos datos
    Object.assign(quest, {
      ...questData,
      updateAt: now,
      updatedBy: user.username,
    });

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

    query.skip((page - 1) * limit).take(limit);
    const [quests, total] = await query.getManyAndCount();

    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuests: total,
      quests,
    };
  }
}

/*
    // 1. validamos si existe el quest por nombre de pdf
    const questionnaire = await this.questRepository.findOne({
      where: { pdfName: quest.pdfName },
    });
    //CAMBIAR CUANDO TE LOGUEAS
    creatorUser = 'JOHAN ROCHA';
    // valida si existe el nombre del pdf del cuestionario
    if (questionnaire)
      throw new BadRequestException(
        'cuestionario ya se encuentra registrado!!',
      );*/
