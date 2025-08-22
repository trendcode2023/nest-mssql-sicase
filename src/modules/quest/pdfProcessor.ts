import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from './pdf.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';

@Processor('pdf-queue')
export class PdfProcessor {
  constructor(
    private readonly pdfService: PdfService,
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
  ) {}

  @Process('generatePdf')
  async handleGeneratePdf(job: Job) {
    const { questId, patientDni, jsonQuest, pdfName } = job.data;

    try {
      const pdfBuffer = await this.pdfService.generatePdf(jsonQuest);

      const uploadDir = `C:/quest-salud/${questId}/`;
      const filePath = path.join(uploadDir, pdfName);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      fs.writeFileSync(filePath, pdfBuffer);

      // actualizar en BD el estado
      await this.questRepository.update(questId, { status: 'PDF_READY' });

      console.log(`✅ PDF generado para quest ${questId}`);
    } catch (err) {
      console.error(`❌ Error generando PDF para quest ${questId}`, err);
    }
  }
}
