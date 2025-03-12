import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { User } from 'src/decorators/user.decorator';
import { ApiQuery } from '@nestjs/swagger';

@Controller('quests')
export class QuestController {
  constructor(private readonly questsService: QuestService) {}

  // 1. crear cuestionario
  @UseInterceptors(DateAdderInterceptor)
  @Post('create')
  createQuest(
    @Body() quest: CreateQuestDto,
    @Req() request: Request & { now: Date },
    @User('id') userId: string,
    // @User('username') loggedInUserDni: string,
  ) {
    return this.questsService.createQuest(quest, userId, request.now);
  }

  // 2. listar cuestionarios
  @Get('getall')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'doctorName', required: false })
  @ApiQuery({ name: 'patientName', required: false })
  @ApiQuery({ name: 'patientDni', required: false })
  getAllQuest(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Query('doctorName') doctorName?: string,
    @Query('patientName') patientName?: string,
    @Query('patientDni') patientDni?: string,
  ) {
    return this.questsService.getAllQuests(
      page,
      limit,
      doctorName,
      patientName,
      patientDni,
    );
  }
  // 3. actualizar cuestionario
  @UseInterceptors(DateAdderInterceptor)
  @Post(':id')
  async updateQuest(
    @Param('id') questId: string,
    @Req() request: Request & { now: Date },
    @Body() questData: Partial<CreateQuestDto>,
    @User('id') userId: string,
  ) {
    return this.questsService.updateQuest(
      questId,
      questData,
      userId,
      request.now,
    );
  }
  @Get('paginated')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de registros por página',
  })
  @ApiQuery({
    name: 'questType',
    required: false,
    type: String,
    description: 'Filtro por tipo de cuestionario',
  })
  @ApiQuery({
    name: 'doctorName',
    required: false,
    type: String,
    description: 'Filtro por nombre del doctor',
  })
  @ApiQuery({
    name: 'patientName',
    required: false,
    type: String,
    description: 'Filtro por nombre del paciente',
  })
  @ApiQuery({
    name: 'patientDni',
    required: false,
    type: String,
    description: 'Filtro por dni del paciente',
  })
  getQuestsPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('questType') questType?: string,
    @Query('doctorName') doctorName?: string,
    @Query('patientName') patientName?: string,
    @Query('patientDni') patientDni?: string,
  ) {
    return this.questsService.getQuestsPaginated(Number(page), Number(limit), {
      questType,
      doctorName,
      patientName,
      patientDni,
    });
  }
}
