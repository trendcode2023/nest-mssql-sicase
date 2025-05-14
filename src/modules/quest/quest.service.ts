import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';
import { UpdateQuestDto } from './dtos/updateQuest.dto';
import { UpdateStatus } from '../users/dtos/UpdateStatus.dto';
import { plainToInstance } from 'class-transformer';
import { QuestResponseDto } from './dtos/QuestResponse.dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // ok
  async createQuest(questData: CreateQuestDto, userId: string, now: Date) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user)
      throw new BadRequestException(`Usuario con ID ${userId} no existe!!`);

    const questType = await this.catalogsRepository.findOne({
      where: { id: questData.questType },
    });
    if (!questType)
      throw new BadRequestException(
        `Tipo de cuestionario ${questData.questType} no existe!!`,
      );

    const newQuest = this.questsRepository.create({
      ...questData,
      createAt: now,
      createdBy: user.username,
      updateAt: now,
      updatedBy: user.username,
      user: user,
    });

    return await this.questsRepository.save(newQuest);
  }

  // ok
  // async updateQuest(
  //   questId: string,
  //   updateData: UpdateQuestDto,
  //   userId: string,
  //   now: Date,
  // ) {
  //   const quest = await this.questsRepository.findOne({
  //     where: { id: questId },
  //   });
  //   if (!quest) {
  //     throw new NotFoundException('Cuestionario no encontrado');
  //   }

  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new UnauthorizedException('Usuario no encontrado');
  //   }

  //   Object.assign(quest, updateData);
  //   quest.updateAt = now;
  //   quest.updatedBy = user.username;

  //   return await this.questsRepository.save(quest);
  // }
  async updateQuest(
    questId: string,
    updateData: UpdateQuestDto,
    userId: string,
    now: Date,
  ) {
    const quest = await this.questsRepository.findOne({
      where: { id: questId },
    });
    if (!quest) {
      throw new NotFoundException('Cuestionario no encontrado');
    }
  
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
  
    // Validar questType si viene en el update
    if (updateData.questType) {
      const questType = await this.catalogsRepository.findOne({
        where: { id: updateData.questType },
      });
      if (!questType) {
        throw new BadRequestException(
          `Tipo de cuestionario ${updateData.questType} no existe!!`,
        );
      }
    }
  
    // Excluir campos que no se deben sobrescribir
    const { createAt, createdBy, ...safeData } = updateData as any;
  
    this.questsRepository.merge(quest, {
      ...safeData,
      updatedBy: user.username,
      updateAt: now,
    });
  
    return await this.questsRepository.save(quest);
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

    return plainToInstance(QuestResponseDto, quest, {
      excludeExtraneousValues: true,
    });

    //return quest;
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

/*
    const filterConditions = [
  { field: 'questType', value: filters?.questType },
  { field: 'patientName', value: filters?.patientName, transform: val => `LOWER(quest.patientName) LIKE :patientName`, transformValue: val => `%${val.toLowerCase()}%` },
  { field: 'patientDni', value: filters?.patientDni, transform: val => `LOWER(quest.patientDni) LIKE :patientDni`, transformValue: val => `%${val.toLowerCase()}%` },
  { field: 'doctorName', value: filters?.doctorName, transform: val => `LOWER(CONCAT(user.names, ' ', user.patSurname, ' ', user.matSurname)) LIKE :doctorName`, transformValue: val => `%${val.toLowerCase()}%` }
];

filterConditions.forEach(condition => {
  if (condition.value) {
    query.andWhere(condition.transform, { [condition.field]: condition.transformValue ? condition.transformValue(condition.value) : condition.value });
  }
});

    */
