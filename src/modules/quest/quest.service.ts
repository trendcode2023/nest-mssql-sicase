import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
  ) {}

  async createQuest(quest: CreateQuestDto, creatorUser: string, now: Date) {
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
      );

    const newQuest = this.questRepository.create({
      ...quest,
      createAt: now,
      createdBy: creatorUser,
      updateAt: now,
      updatedBy: creatorUser,
    });
    return this.questRepository.save(newQuest);
  }

  async getAllQuests() {
    return this.questRepository.find();
  }
}
