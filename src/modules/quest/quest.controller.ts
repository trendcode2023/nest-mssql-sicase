import {
  Body,
  Controller,
  Get,
  Param,
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
    @User('id') userId: string,
    // @User('username') loggedInUserDni: string,
  ) {
    return this.questService.createQuest(quest, userId, request.now);
  }

  @Get('getall')
  getAllQuest() {
    return this.questService.getAllQuests();
  }
  @UseInterceptors(DateAdderInterceptor)
  @Post(':id')
  async updateQuest(
    @Param('id') id: string,
    @Req() request: Request & { now: Date },
    @Body() questData: Partial<CreateQuestDto>,
    @User('id') userId: string,
  ) {
    return this.questService.updateQuest(id, questData, userId, request.now);
  }
}
