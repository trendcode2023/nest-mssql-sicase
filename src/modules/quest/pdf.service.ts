import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { Formulario } from './dtos/formulario';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { join } from 'path';
import { Console, log } from 'console';
import { registerCustomHandlebarsHelpers } from '../../utils/handlebars-helpers';


@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Quest)
    private readonly questsRepository: Repository<Quest>,
    
  ) {
    registerCustomHandlebarsHelpers();
  }

  /** ✅ Obtiene el formulario y genera el PDF */
  async generatePdf(questId: string): Promise<Buffer> {

    try {
    const quest = await this.questsRepository.findOneBy({ id: questId });

    if (!quest) {
      throw new NotFoundException(`Formulario con id ${questId} no encontrado`);
    }
    const data = JSON.parse(quest.jsonQuest) as Formulario;
    console.log(data)
    const html = this.generateHtmlFromTemplate('quest_salud', data);    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    fs.writeFileSync('preview.html', html);
    await page.setContent(html, { waitUntil: 'load', timeout: 10000 }); // 10s
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('❌ Error al generar el PDF:', error);
      throw error;
    }
  }

  private generateHtmlFromTemplate(templateName: string, data: any): string {
    const templatePath = path.join(process.cwd(), 'dist', 'assets', 'templates', `${templateName}.hbs`);
    const templateStr = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateStr);
    return template(data);
  }
}
