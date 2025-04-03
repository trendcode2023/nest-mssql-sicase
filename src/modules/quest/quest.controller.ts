import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UpdateQuestDto } from './dtos/updateQuest.dto';
import { UpdateStatus } from '../users/dtos/UpdateStatus.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('quests')
export class QuestController {
  constructor(
    private readonly questsService: QuestService,
    private readonly pdfService: PdfService,
  ) {}

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
    @Body() updateData: UpdateQuestDto,
  ) {
    return this.questsService.updateQuest(
      questId,
      updateData,
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('getQuestById/:id') // Ruta dinámica
  async getUserById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.questsService.getQuestById(id);
  }

  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(DateAdderInterceptor)
  @Post('update-status/:id')
  async updateUserStatus(
    @Param('id') questId: string,
    @User('username') username: string,
    @Body() status: UpdateStatus, // El estado se pasa en el Body
    @Req() request: Request & { now: Date },
  ) {
    return this.questsService.updateQuestStatus(
      questId,
      username,
      status,
      request.now,
    );
  }
}
