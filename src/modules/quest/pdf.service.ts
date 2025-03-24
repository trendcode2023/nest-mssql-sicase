import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { Quest } from './quest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Index, Repository } from 'typeorm';
import { Formulario } from './dtos/formulario';

@Injectable()
export class PdfService {
  private font;
  private pdfDoc: PDFDocument;
  private page: PDFPage;
  private y: number;
  private readonly pageWidth = 595;
  private readonly pageHeight = 842;
  private readonly margin = 50;
  private readonly lineSpacing = 14; // Espaciado entre líneas
  private index = 0;
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
  ) {}

  async getQuestById(id: string): Promise<Quest> {
    const quest = await this.questsRepository.findOne({
      where: { id },
    });

    if (!quest) {
      throw new NotFoundException(`Quest con id ${id} no encontrado`);
    }

    return quest;
  }

  async generatePdf(questId: string): Promise<Buffer> {
    const formulario = await this.getQuestById(questId);
    const data = JSON.parse(formulario.jsonQuest) as Formulario;
    console.log('data exportar', data);
    this.pdfDoc = await PDFDocument.create();
    this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.y = this.pageHeight - this.margin;

    this.addHeader();
    this.addPersonalInfo(data);
    this.addInstructions();
    this.addSection1(data);
    this.addNoteSection();
    await this.addHealthQuestions(data);

    const pdfBytes = await this.pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /** 📌 Agrega el encabezado */
  private addHeader() {
    this.addText('PACÍFICO SEGUROS', 20, this.y, 9, rgb(0, 0, 0.5));
    this.y -= 15;
    this.addText('DECLARACIÓN ADICIONAL DE SALUD', 20, this.y, 12);
    this.y -= 10;
    this.page.drawLine({
      start: { x: 20, y: this.y },
      end: { x: 565, y: this.y },
      thickness: 1,
    });
    this.y -= 30;
  }

  /** 📌 Agrega información personal del asegurado con mejor alineación */
  private addPersonalInfo(data: Formulario) {
    this.addText('Parte II', 20, this.y);
    this.addText('Nº Solicitud:', 350, this.y);
    this.addText(data.declaracion.nrosolicitud, 450, this.y);
    this.y -= this.lineSpacing;

    this.addText('Declaraciones hechas al médico', 20, this.y);
    this.addText('Asesor:', 350, this.y);
    this.addText(data.declaracion.asesor, 400, this.y);
    this.y -= this.lineSpacing;

    this.addText('Propuesto Asegurado:', 20, this.y);
    this.addText(data.declaracion.names, 140, this.y);
    this.addText('Fecha de Nacimiento:', 350, this.y);
    this.addText(data.declaracion.fechanacimiento, 470, this.y);
    this.y -= this.lineSpacing;
    this.addText('Estado Civil:', 20, this.y);
    this.addText(data.declaracion.estadocivil, 140, this.y);
    this.addText('DNI:', 350, this.y);
    this.addText(data.declaracion.numerodocumento, 470, this.y);
    this.y -= 25;
  }

  /** 📌 Agrega instrucciones con espaciado adecuado */
  private addInstructions() {
    this.addText(
      'INSTRUCCIONES PARA EL MÉDICO EXAMINADOR',
      150,
      this.y,
      10,
      rgb(0, 0, 0),
    );
    this.y -= 15;
    const instructions = [
      '1. Una vez comenzado el examen, el informe correspondiente pasa a ser propiedad de la Compañía y ' +
        'no debe ser alterado o destruido cualquiera sea el dictamen, incluso si el Propuesto Asegurado ' +
        'u otra persona se ofrecen a pagar sus honorarios.',
      '2. No se permite al M.E. examinar a sus pacientes o familiares, o a los clientes de un familiar suyo.',
      '3. El Propuesto Asegurado debe poner su firma en cualquier alteración en las declaraciones hechas por él.',
      '4. Tanto las declaraciones del Propuesto Asegurado como su informe deben ser registradas a mano por usted.',
      '5. Si está usando sistema métrico para la medida, indíquelo.',
    ];

    // 📌 Ajustar texto largo al ancho de la hoja (550px de ancho menos margen)
    instructions.forEach((instruction) => {
      const lines = this.wrapText(instruction, 550 - this.margin * 2);
      lines.forEach((line, index) => {
        this.addText(line, 40, this.y - index * this.lineSpacing);
      });
      this.y -= lines.length * this.lineSpacing + 2; // Espaciado entre párrafos
    });

    this.y -= 20;
    // this.addParagraph(instructions, 25, this.y - 15);
  }

  /** 📌 Agrega la Sección 1 con preguntas y respuestas alineadas */
  private addSection1(data: Formulario) {
    this.addText(
      'POR FAVOR, CONTESTE A SU MEJOR SABER Y ENTENDER',
      150,
      this.y,
      10,
    );
    this.y -= 20;

    const section1Questions = [
      {
        q: 'a. ¿Nombre y dirección de su médico particular?',
        a: data.entender.nameanddirection,
      },
      {
        q: 'b. ¿Fecha y motivo de la consulta más reciente?',
        a: data.entender.fechaandmotivation,
      },
      {
        q: 'c. ¿Qué tratamiento o medicación se prescribió?',
        a: data.entender.medication,
      },
    ];

    section1Questions.forEach(({ q, a }) => {
      this.addText(q, 20, this.y);
      this.addText(a, 250, this.y);
      this.y -= this.lineSpacing;
    });

    this.y -= 20;
  }

  /** 📌 Agrega la Nota */
  private addNoteSection() {
    this.checkSpace();
    const noteX = 20;
    const noteWidth = 550;
    const noteHeight = 55;
    const noteY = this.y - noteHeight;

    this.page.drawRectangle({
      x: noteX,
      y: noteY,
      width: noteWidth,
      height: noteHeight,
      borderWidth: 1.5,
      borderColor: rgb(0, 0, 0),
    });

    this.addText('NOTA:', noteX + 20, noteY + 35, 11, rgb(1, 0, 0));
    this.addParagraph(
      [
        'En caso de respuesta afirmativa a alguna pregunta, indique el número de ésta e incluya',
        'el diagnóstico, fecha, duración, grado de recuperación y nombre/dirección de médicos a',
        'quienes se pueda pedir información.',
      ],
      noteX + 55,
      noteY + 35,
    );

    this.y -= noteHeight - 10;
  }

  /** 📌 Agrega la sección de preguntas de salud */
  private async addHealthQuestions(data: Formulario) {
    this.addText(
      '2. ¿Ha sido tratado o tiene conocimiento de haber padecido de:',
      20,
      this.y,
    );
    this.y -= 15;
    this.addText('Sí', 520, this.y);
    this.addText('No', 540, this.y);
    this.y -= 15;

    const questions = [
      'a. Enfermedad o defecto de ojos, oídos, nariz o garganta?',
      'b. Mareos, desmayos, convulsiones, cefaleas, torpeza al hablar, parálisis o ataque cerebral?',
      'c. Dificultad al respirar, bronquitis, asma, neumonía?',
      'd. Dolor en el pecho, palpitaciones, hipertensión, soplo cardíaco?',
      'e. Ictericia, hernia, colitis, úlcera, hemorragias internas?',
      'f. Diabetes, enfermedad de los riñones, vejiga?',
      'g. Enfermedad de la tiroides o glándulas endocrinas?',
      'h. Reumatismo, artritis, gota, escoliosis?',
      'i. Alguna deformidad, cojera o amputación?',
      'j. Cáncer, tumores, linfomas?',
      'k. Alergias, anemia u otra enfermedad de la sangre?',
      'l. Consumo excesivo de alcohol?',
    ];

    questions.forEach((question) => {
      this.checkSpace();
      const lines = this.wrapText(question, 350);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });
      const quest = data.entenderEnfermedades[this.index];
      this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
      this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
      const sustento = this.wrapText(quest.sustento, 500);
      this.y -= 25;
      sustento.forEach((line, i) => {
        this.addText(line, 40, this.y - i * 12);
      });
      this.index++;
      this.y -= 50;
    });

    this.y -= 20;
    // 📌 **Pregunta 3: Consumo de tabaco**
    this.addQuestion3(data);
    await this.addSignatureSection(data);
    // 📌 **Preguntas 4, 5 y 6**
    this.addQuestions456(data);
    this.addQuestion7(data);
    this.addQuestions8to9(data);
    this.addQuestion10(data);
    this.addQuestion11(data);
    this.addQuestion13(data);
    this.addQuestions15To17(data);
    await this.addSignatureSection2(data);
  }

  /** 📌 Agrega la Pregunta 3: Consumo de Tabaco */
  private addQuestion3(data: Formulario) {
    const quest = data.entenderEnfermedades[this.index];
    this.checkSpace();

    // **Texto de la pregunta 3**
    const questionText =
      '3. ¿En la actualidad fuma usted o durante los últimos 12 meses ha fumado cigarrillos, cigarros, pipa o ha usado tabaco en cualquier forma?';
    const lines = this.wrapText(questionText, 480); // Ajustar ancho del texto

    lines.forEach((line, i) => {
      this.addText(line, 25, this.y - i * this.lineSpacing);
    });

    this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
    this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'

    this.y -= this.lineSpacing * lines.length + 10;

    // **Subtexto para detallar cigarrillos al día**
    this.addText('(En caso afirmativo, detalle cuántos al día)', 25, this.y);

    this.addText(quest.sustento, 300, this.y);

    this.y -= 50;
  }

  /** 📌 Agrega las Preguntas 4, 5 y 6 */
  private addQuestions456(data: Formulario) {
    this.checkSpace();

    const questions = [
      '4. ¿Ha usado alguna vez drogas estupefacientes, a menos que fuera bajo consejo médico?',
      '5. ¿Está usted actualmente sometido a observación, tratamiento o medicación por alguna enfermedad?',
      '6. ¿Tiene usted la intención de buscar consejo médico, tratamiento o hacer cualquier prueba médica?',
    ];

    questions.forEach((question) => {
      this.checkSpace();
      const lines = this.wrapText(question, 350);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });
      const quest = data.entenderEnfermedades[this.index];
      this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
      this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
      const sustento = this.wrapText(quest.sustento, 500);
      this.y -= 25;
      sustento.forEach((line, i) => {
        this.addText(line, 40, this.y - i * 12);
      });
      this.index++;
      this.y -= 50;
    });
  }

  /** 📌 Agrega la Pregunta 7 */
  private addQuestion7(data: Formulario) {
    this.checkSpace();

    // **Título de la Pregunta 7**
    this.addText('7. En los últimos 5 años:', 20, this.y, 10); // Rojo para destacar
    this.y -= this.lineSpacing + 5;

    // **Subpreguntas de la pregunta 7**
    const subQuestions = [
      'a. ¿Ha tenido alguna enfermedad física o mental aparte de las ya mencionadas?',
      'b. ¿Ha tenido alguna revisión, consulta, lesión u operación quirúrgica?',
      'c. ¿Ha sido paciente en hospital, clínica, sanatorio u otros establecimientos médicos?',
      'd. ¿Ha sido sometido a electrocardiograma, rayos X u otro tipo de análisis?',
      'e. ¿Se le ha aconsejado algún análisis, hospitalización u operación que no se hubiera realizado?',
    ];

    subQuestions.forEach((question) => {
      this.checkSpace();
      const lines = this.wrapText(question, 350);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });
      const quest = data.entenderEnfermedades[this.index];
      this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
      this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
      const sustento = this.wrapText(quest.sustento, 500);
      this.y -= 25;
      sustento.forEach((line, i) => {
        this.addText(line, 40, this.y - i * 12);
      });
      this.index++;
      this.y -= 50;
    });

    // subQuestions.forEach((question) => {
    //   this.checkSpace();

    //   // **Dividir el texto en varias líneas si es demasiado largo**
    //   let lines = this.wrapText(question, 480);
    //   lines.forEach((line, i) => {
    //     this.addText(line, 25, this.y - i * this.lineSpacing);
    //   });

    //   this.drawCheckboxWithOut(520, this.y);
    //   this.drawCheckboxWithOut(540, this.y);

    //   this.y -= this.lineSpacing * lines.length + 10; // Espacio entre preguntas
    // });
  }

  /** 📌 Agrega las Preguntas 8 y 9 */
  private addQuestions8to9(data: Formulario) {
    this.checkSpace();

    const questions = [
      '8. ¿Ha tenido aplazamiento, rechazo o reducción del servicio militar por deficiencia física o mental?',
      '9. ¿Ha solicitado o percibido alguna vez indemnización por incapacidad de cualquier tipo?',
    ];

    questions.forEach((question) => {
      this.checkSpace();
      const lines = this.wrapText(question, 350);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });
      const quest = data.entenderEnfermedades[this.index];
      this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
      this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
      const sustento = this.wrapText(quest.sustento, 500);
      this.y -= 25;
      sustento.forEach((line, i) => {
        this.addText(line, 40, this.y - i * 12);
      });
      this.index++;
      this.y -= 50;
    });
  }

  /** 📌 Agrega la Pregunta 10 con la tabla de antecedentes familiares */
  private addQuestion10(data: Formulario) {
    const familiares = data.familiares;
    this.checkSpace();

    // 📌 **Título de la pregunta**
    const questionLines = this.wrapText(
      '10. ¿Hay en su familia antecedentes de tuberculosis, diabetes, cáncer, hipertensión, enfermedad sanguínea o renal, enfermedad mental o suicidio?',
      460,
    );

    questionLines.forEach((line, i) => {
      this.addText(line, 25, this.y - i * this.lineSpacing);
    });

    this.drawCheckboxWithOut(520, this.y);
    this.drawCheckboxWithOut(540, this.y);
    this.y -= this.lineSpacing * questionLines.length + 5;

    // 📌 **Encabezados de la tabla**
    const startX = 25;
    const colWidths = [120, 80, 280, 80]; // Columnas: Familiar, Edad si viven, Estado de salud, Edad al morir
    const headerY = this.y;

    this.addText('Familiar', startX + 10, headerY, 9);
    this.addText('Edad si viven', startX + colWidths[0] + 10, headerY, 9);
    this.addText(
      'Estado de salud / Causa de muerte',
      startX + colWidths[0] + colWidths[1] + 10,
      headerY,
      9,
    );
    this.addText(
      'Edad al morir',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + 10,
      headerY,
      9,
    );

    // 📌 **Dibujar la línea del encabezado**
    this.page.drawLine({
      start: { x: startX, y: headerY - 5 },
      end: {
        x: startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        y: headerY - 5,
      },
      thickness: 1,
    });

    this.y -= this.lineSpacing;

    // 📌 **Dibujar las filas**
    familiares.forEach(({ tipo, edadSiVive, estadoSalud, edadAlMorir }) => {
      this.checkSpace();

      // 📌 **Agregar datos en sus respectivas columnas**
      this.addText(tipo, startX + 10, this.y); // Familiar
      this.addText(edadSiVive.toString(), startX + colWidths[0] + 30, this.y); // Edad si viven

      // 📌 **Asegurar que el texto largo no se desborde**
      const wrappedHealth = this.wrapText(estadoSalud, colWidths[2] - 10);
      wrappedHealth.forEach((line, i) => {
        this.addText(
          line,
          startX + colWidths[0] + colWidths[1] + 10,
          this.y - i * this.lineSpacing,
        );
      });

      this.addText(
        edadAlMorir.toString(),
        startX + colWidths[0] + colWidths[1] + colWidths[2] + 20,
        this.y,
      );

      this.y -= this.lineSpacing * wrappedHealth.length + 5; // Espaciado extra
    });

    this.y -= 15;
  }

  /** 📌 Agrega la Pregunta 11 con estatura y peso */
  private addQuestion11(data: Formulario) {
    this.checkSpace();

    this.addText('11. a. Estatura', 20, this.y);
    this.addText(data.entenderEnfermedades[this.index].answer, 120, this.y);
    this.index++;
    this.addText('(m)', 135, this.y);
    this.addText(data.entenderEnfermedades[this.index].answer, 170, this.y);
    this.index++;
    this.addText('(cm)', 190, this.y);
    this.y -= this.lineSpacing;

    this.addText('b. Peso', 25, this.y);
    this.addText(data.entenderEnfermedades[this.index].answer, 120, this.y);
    this.index++;
    this.addText('(kg)', 170, this.y);
    this.y -= this.lineSpacing + 5;

    // **Checkbox para respuesta Sí/No**
    const quest = data.entenderEnfermedades[this.index];
    this.addText(
      '12. ¿Ha tenido algún cambio de peso en los últimos 12 meses?',
      25,
      this.y,
    );
    this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
    this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
    const sustento = this.wrapText(quest.sustento, 500);
    sustento.forEach((line, i) => {
      this.addText(line, 40, this.y - i * 12);
    });
    this.y -= 25;
    this.index++;
    this.y -= this.lineSpacing + 10;
  }

  /** 📌 Agrega la Pregunta 13 sobre embarazo */
  private addQuestion13(data: Formulario) {
    this.checkSpace();

    this.addText('13. SI EL PROPUESTO ASEGURADO ES MUJER', 20, this.y, 10);
    this.y -= this.lineSpacing;

    const subQuestions = [
      'a. A su mejor saber y entender',
      '    ¿Ha tenido alguna vez trastornos de la menstruación, pechos, aparato genital o alteraciones en el embarazo?',
      'b. ¿Está embarazada en la actualidad?',
      '    En caso afirmativo, ¿cuántos meses?',
    ];

    subQuestions.forEach((question, index) => {
      this.checkSpace();
      const xPosition = index % 2 === 0 ? 25 : 40;
      const lines = this.wrapText(question, 480);
      lines.forEach((line, i) => {
        this.addText(line, xPosition, this.y - i * this.lineSpacing);
      });

      if (index === 0 || index === 2) {
        this.drawCheckboxWithOut(520, this.y);
        this.drawCheckboxWithOut(540, this.y);
      }

      this.y -= this.lineSpacing * lines.length + 5;
    });
  }

  /** 📌 Agrega la Pregunta 15, 16 y 17 con sus checkboxes alineados */
  private addQuestions15To17(data) {
    this.index++;
    this.index++;
    this.checkSpace();

    const questions = [
      '14. ¿Ha recibido usted tratamiento o consejo médico en relación al SIDA o condiciones relacionadas con él, o en relación con enfermedades de transmisión sexual?',
      '15. ¿Le han dicho que ha tenido SIDA o el Complejo Relacionado al SIDA?',
      '16. ¿Ha tenido o le han informado que tiene pruebas sanguíneas positivas para anticuerpos del virus del SIDA?',
      '17. ¿Tiene usted alguno de estos síntomas sin explicación: fatiga, pérdida de peso, diarrea, ganglios linfáticos inflamados o extrañas lesiones en la piel?',
    ];

    questions.forEach((question) => {
      this.checkSpace();
      const lines = this.wrapText(question, 420);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });
      const quest = data.entenderEnfermedades[this.index];
      this.drawCheckboxWithX(520, this.y, quest.answer?.toLowerCase() === 's'); // Marca si es 's'
      this.drawCheckboxWithX(540, this.y, quest.answer?.toLowerCase() === 'n'); // Marca si es 'n'
      const sustento = this.wrapText(quest.sustento, 500);
      this.y -= 25;
      sustento.forEach((line, i) => {
        this.addText(line, 40, this.y - i * 12);
      });
      this.index++;
      this.y -= 50;
    });

    this.y -= 10; // Espacio antes de la siguiente sección
  }

  /** 📌 Agrega la sección de firma */
  // private addSignatureSection(data:Formulario) {
  //   const firmaBase64 = data.firma.propuestoAsegurado
  //   this.checkSpace();
  //   this.drawBox(180, this.y, 240, 40);
  //   this.addText('Firma del Propuesto Asegurado', 220, this.y - 15);
  //   this.y -=60
  // }

  private async addSignatureSection(data: Formulario) {
    this.checkSpace();

    const firmaBase64 = data.firma.propuestoAsegurado;

    // 📌 Posiciones y dimensiones
    const boxX = 180;
    const boxY = this.y;
    const boxWidth = 240;
    const boxHeight = 40;

    // 📌 Dibujar la línea base de firma
    this.page.drawLine({
      start: { x: boxX, y: boxY - 15 },
      end: { x: boxX + boxWidth, y: boxY - 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // 📌 Agregar texto alineado debajo de la línea
    this.addText('Firma del Propuesto Asegurado', boxX + 40, boxY - 35);

    // 📌 Si existe una firma en Base64, agregarla al PDF
    if (firmaBase64?.startsWith('data:image/png;base64,')) {
      const base64Image = firmaBase64.replace('data:image/png;base64,', '');
      const imageBytes = Buffer.from(base64Image, 'base64');
      const pngImage = await this.pdfDoc.embedPng(imageBytes);
      const pngDims = pngImage.scale(1);

      // 📌 Ajustar tamaño de la firma para que sea más grande (1.2x)
      const scale =
        Math.min(boxWidth / pngDims.width, (boxHeight - 10) / pngDims.height) *
        1.2;
      const signatureWidth = pngDims.width * scale;
      const signatureHeight = pngDims.height * scale;

      // 📌 Centrar la imagen sobre la línea sin que cubra el texto
      const imageX = boxX + (boxWidth - signatureWidth) / 2;
      const imageY = boxY - 15 + 8; // Se posiciona ligeramente arriba de la línea

      this.page.drawImage(pngImage, {
        x: imageX,
        y: imageY,
        width: signatureWidth,
        height: signatureHeight,
      });
    }

    this.y -= 80; // Espacio después de la firma
  }

  /** 📌 Agrega la sección de firmas alineadas */
  private async addSignatureSection2(data: Formulario) {
    this.checkSpace();

    const firmaMedicoBase64 = data.firma.propuestoAsegurado;
    const firmaAseguradoBase64 = data.firma.propuestoAsegurado;

    const startX = 100;
    const middleX = this.pageWidth / 2 + 30;
    const yPosition = this.y - 50;

    // 📌 Línea de "Firmado en..."
    this.addText('Firmado en', startX, yPosition + 20);

    this.drawLine(startX + 50, yPosition + 20, 80); // Espacio para la ciudad
    this.addText('el', startX + 140, yPosition - 20);
    this.drawLine(startX + 160, yPosition + 20, 30); // Espacio para el día
    this.addText('de', startX + 200, yPosition + 20);
    this.drawLine(startX + 220, yPosition + 20, 80); // Espacio para el mes
    this.addText('del 20', startX + 310, yPosition + 20);
    this.drawLine(startX + 340, yPosition + 20, 30); // Espacio para el año

    // 📌 Firma del Médico Examinador
    this.drawLine(startX, yPosition - 40, 180);
    this.addText('Firma del Médico Examinador', startX + 20, yPosition - 55);

    // 📌 Firma del Propuesto Asegurado
    this.drawLine(middleX, yPosition - 40, 180);
    this.addText('Firma del Propuesto Asegurado', middleX + 10, yPosition - 55);

    // 📌 Agregar las imágenes de las firmas
    if (firmaMedicoBase64?.startsWith('data:image/png;base64,')) {
      await this.drawSignatureImage(
        firmaMedicoBase64,
        startX,
        yPosition - 40,
        180,
        50,
      );
    }
    if (firmaAseguradoBase64?.startsWith('data:image/png;base64,')) {
      await this.drawSignatureImage(
        firmaAseguradoBase64,
        middleX,
        yPosition - 40,
        180,
        50,
      );
    }

    this.y -= 120; // Ajustar espacio después de la sección
  }

  /** 📌 Método para dibujar la firma en el PDF */
  private async drawSignatureImage(
    base64Image: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    try {
      const base64Data = base64Image.replace('data:image/png;base64,', '');
      const imageBytes = Buffer.from(base64Data, 'base64');
      const pngImage = await this.pdfDoc.embedPng(imageBytes);
      const pngDims = pngImage.scale(1);

      // 📌 Ajustar tamaño de la firma para que sea más grande (1.2x)
      const scale =
        Math.min(width / pngDims.width, height / pngDims.height) * 1.2;
      const signatureWidth = pngDims.width * scale;
      const signatureHeight = pngDims.height * scale;

      // 📌 Centrar la imagen sobre la línea sin que cubra el texto
      const imageX = x + (width - signatureWidth) / 2;
      const imageY = y + (height - signatureHeight) / 2;

      this.page.drawImage(pngImage, {
        x: imageX,
        y: imageY,
        width: signatureWidth,
        height: signatureHeight,
      });
    } catch (error) {
      console.error('🚨 Error al procesar la firma:', error.message);
      this.addText('⚠ Error al cargar firma', x + 20, y + 10, 8, rgb(1, 0, 0));
    }
  }

  /** 📌 Dibuja una línea en coordenadas específicas */
  private drawLine(x: number, y: number, length: number) {
    this.page.drawLine({
      start: { x, y },
      end: { x: x + length, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  }

  /** 📌 Agrega texto con tamaño ajustable */
  private addText(
    text: string,
    x: number,
    y: number,
    size = 10,
    color = rgb(0, 0, 0),
  ) {
    this.page.drawText(text, { x, y, size, font: this.font, color });
  }

  /** 📌 Agrega párrafos con ajuste de líneas */
  private addParagraph(lines: string[], x: number, y: number) {
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x,
        y: y - index * 12,
        size: 10,
        font: this.font,
      });
    });
    this.y = y - lines.length * 12;
  }

  /** 📌 Verifica el espacio disponible y agrega una nueva página si es necesario */
  private checkSpace() {
    if (this.y - 50 < this.margin) {
      this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
      this.y = this.pageHeight - this.margin;
    }
  }

  /** 📌 Dibuja un cuadro */
  private drawBox(x: number, y: number, width: number, height: number) {
    this.page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
  }

  /** 📌 Dibuja un checkbox sin etiqueta */
  private drawCheckboxWithOut(x: number, y: number) {
    this.page.drawRectangle({
      x,
      y: y - 12,
      width: 12,
      height: 12,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
  }

  /** 📌 Método para dividir texto en múltiples líneas si es muy largo */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = this.font.widthOfTextAtSize(testLine, 10);

      if (textWidth < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private drawCheckboxWithX(x: number, y: number, checked: boolean) {
    this.page.drawRectangle({
      x,
      y: y - 12,
      width: 12,
      height: 12,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    if (checked) {
      this.page.drawText('X', {
        x: x + 3,
        y: y - 10,
        size: 10,
        font: this.font,
        color: rgb(0, 0, 0),
      });
    }
  }
}
