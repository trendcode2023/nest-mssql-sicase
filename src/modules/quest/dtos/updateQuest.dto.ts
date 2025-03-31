import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestDto } from './createQuest.dto';

export class UpdateQuestDto extends PartialType(CreateQuestDto) {}
