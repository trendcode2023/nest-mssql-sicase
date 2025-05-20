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
  async generatePdf(jsonQuest: string): Promise<Buffer> {
    try {
      const data = JSON.parse(jsonQuest) as Formulario;
      const imagePath = path.join(
        process.cwd(),
        'dist',
        'assets',
        'images',
        'logo_pacifico.png',
      );
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      const imageSoplo = path.join(
        process.cwd(),
        'dist',
        'assets',
        'images',
        'imageform.png',
      );
      const imageBufferSoplo = fs.readFileSync(imageSoplo);
      const imageBase64Soplo = imageBufferSoplo.toString('base64');
      const logoMimeType = 'image/png'; // o image/jpeg si fuera JPG
      data.logo = `data:${logoMimeType};base64,${imageBase64}`;
      data.imageSoplo = `data:${logoMimeType};base64,${imageBase64Soplo}`;
      //console.log(data)
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
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'assets',
      'templates',
      `${templateName}.hbs`,
    );
    const templateStr = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateStr);
    return template(data);
  }
}
