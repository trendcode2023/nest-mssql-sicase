import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { User } from 'src/decorators/user.decorator';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}
  @UseInterceptors(DateAdderInterceptor)
  @Post('create')
  createQuest(
    @Body() quest: CreateQuestDto,
    @Req() request: Request & { now: Date },
    @User('username') creatorUser: string,
  ) {
    return this.questService.createQuest(quest, creatorUser, request.now);
  }

  @Get('getall')
  getAllQuest() {
    return this.questService.getAllQuests();
  }
}
