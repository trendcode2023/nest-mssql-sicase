import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { DateAdderInterceptor } from 'src/interceptors/date.adder.interceptors';
import { User } from 'src/decorators/user.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('quests')
export class QuestController {
  constructor(
    private readonly questsService: QuestService,
    private readonly pdfService: PdfService,
  ) {}

  // 1. crear cuestionario

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(DateAdderInterceptor)
  @Post('update/:id')
  async updateQuest(
    @Param('id') questId: string,
    @Req() request: Request & { now: Date },
    @User('id') userId: string,
    @Body() questData: string,
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
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    description: 'Orden (ASC o DESC)',
  })
  getQuestsPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('questType') questType?: string,
    @Query('doctorName') doctorName?: string,
    @Query('patientName') patientName?: string,
    @Query('patientDni') patientDni?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.questsService.getQuestsPaginated(
      Number(page),
      Number(limit),
      {
        questType,
        doctorName,
        patientName,
        patientDni,
      },
      order,
    );
  }

  @Get('declaracion-salud/:id')
  async downloadPdf(@Res() res: Response, @Param('id') questId: string) {
    const pdfBuffer = await this.pdfService.generatePdf(questId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="declaracion_salud.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
