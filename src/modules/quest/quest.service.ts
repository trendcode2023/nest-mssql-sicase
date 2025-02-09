import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { User } from '../users/users.entity';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createQuest(quest: CreateQuestDto, userId: string, now: Date) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    //CAMBIAR CUANDO TE LOGUEAS

    const newQuest = this.questsRepository.create({
      ...quest,
      createAt: now,
      createdBy: user.username,
      updateAt: now,
      updatedBy: user.username,
      user: user, // referencia al usuario que creo el cuestionario
    });
    return this.questsRepository.save(newQuest);
  }

  async getAllQuests() {
    return this.questsRepository.find();
  }

  //aqui va la fucion actualizar

  async updateQuest(
    id: string,
    questData: Partial<CreateQuestDto>,
    userId: string,
    now: Date,
  ) {
    // Buscar la Quest existente
    const quest = await this.questsRepository.findOne({ where: { id } });
    if (!quest) {
      throw new Error('Quest no encontrada');
    }

    // Buscar el usuario que realiza la actualización
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    console.log(now);
    // Actualizar la Quest con los nuevos datos
    Object.assign(quest, {
      ...questData,

      updateAt: now,
      updatedBy: user.username,
    });

    return this.questsRepository.save(quest);
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
