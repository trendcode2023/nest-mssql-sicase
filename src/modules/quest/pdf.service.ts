import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { Quest } from './quest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    constructor(
      @InjectRepository(Quest)
      private questsRepository: Repository<Quest>,
    ) {}

  //   async getQuestById(id: string): Promise<Quest> {
  //     const quest = await this.questsRepository.findOne({
  //       where: { id }
  //     });
  
  //     if (!quest) {
  //       throw new NotFoundException(`Quest con id ${id} no encontrado`);
  //     }
  
  //     return quest;
  // }
   


  async generatePdf(): Promise<Buffer> {
    // const formulario = await this.getQuestById("D4BB5B9E-4682-4406-8D32-7F44F0F78E2D");
    // const data = JSON.parse(formulario.jsonQuest) as Formulario
    // console.log("data exportar",data)
    this.pdfDoc = await PDFDocument.create();
    this.page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.y = this.pageHeight - this.margin;

    this.addHeader();
    this.addPersonalInfo();
    this.addInstructions();
    this.addSection1();
    this.addNoteSection();
    this.addHealthQuestions();

    const pdfBytes = await this.pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /** 📌 Agrega el encabezado */
  private addHeader() {
    this.addText('PACÍFICO SEGUROS', 20, this.y, 9, rgb(0, 0, 0.5));
    this.y -= 15;
    this.addText('DECLARACIÓN ADICIONAL DE SALUD', 20, this.y, 12);
    this.y -= 10;
    this.page.drawLine({ start: { x: 20, y: this.y }, end: { x: 565, y: this.y }, thickness: 1 });
    this.y -= 30;
  }

  /** 📌 Agrega información personal del asegurado con mejor alineación */
  private addPersonalInfo() {
    this.addText('Parte II', 20, this.y);
    this.addText('Nº Solicitud:', 350, this.y);
    this.addText('SOLI000001', 450, this.y);
    this.y -= this.lineSpacing;

    this.addText('Declaraciones hechas al médico', 20, this.y);
    this.addText('Asesor:', 350, this.y);
    this.addText('FRANK ROCHA HORNA', 450, this.y);
    this.y -= this.lineSpacing;

    this.addText('Propuesto Asegurado:', 20, this.y);
    this.addText('JOHAN ROCHA HORNA', 140, this.y);
    this.addText('Fecha de Nacimiento:', 350, this.y);
    this.addText('21/08/1998', 470, this.y);
    this.y -= this.lineSpacing;
    this.addText('Estado Civil:', 20, this.y);
    this.addText('Casado', 140, this.y);
    this.addText('DNI:', 350, this.y);
    this.addText('74047141', 470, this.y);
    this.y -= 25;
  }

  /** 📌 Agrega instrucciones con espaciado adecuado */
  private addInstructions() {
    this.addText('INSTRUCCIONES PARA EL MÉDICO EXAMINADOR', 150, this.y, 10, rgb(0, 0, 0));
    this.y -= 15;
    const instructions = [
      '1. Una vez comenzado el examen, el informe correspondiente pasa a ser propiedad de la Compañía y '
         + 'no debe ser alterado o destruido cualquiera sea el dictamen, incluso si el Propuesto Asegurado '
          +  'u otra persona se ofrecen a pagar sus honorarios.',
      '2. No se permite al M.E. examinar a sus pacientes o familiares, o a los clientes de un familiar suyo.',
      '3. El Propuesto Asegurado debe poner su firma en cualquier alteración en las declaraciones hechas por él.',
      '4. Tanto las declaraciones del Propuesto Asegurado como su informe deben ser registradas a mano por usted.',
      '5. Si está usando sistema métrico para la medida, indíquelo.'
    ];

    // 📌 Ajustar texto largo al ancho de la hoja (550px de ancho menos margen)
    instructions.forEach(instruction => {
      let lines = this.wrapText(instruction, 550 - this.margin * 2);
      lines.forEach((line, index) => {
        this.addText(line, 40, this.y - index * this.lineSpacing);
      });
      this.y -= lines.length * this.lineSpacing + 2; // Espaciado entre párrafos
    });

    this.y -= 20;
   // this.addParagraph(instructions, 25, this.y - 15);
  }

    /** 📌 Agrega la Sección 1 con preguntas y respuestas alineadas */
  private addSection1() {
      this.addText('POR FAVOR, CONTESTE A SU MEJOR SABER Y ENTENDER', 150, this.y, 10);
      this.y -= 20;
  
      const section1Questions = [
        { q: 'a. ¿Nombre y dirección de su médico particular?', a: 'Dr. Acosta - Clínica Internacional (Endocrinólogo)' },
        { q: 'b. ¿Fecha y motivo de la consulta más reciente?', a: 'Hace 1 mes (control mensual de Diabetes)' },
        { q: 'c. ¿Qué tratamiento o medicación se prescribió?', a: 'Metformina 850 1tab/d. + Atorvastatina 20mg 1tab/d.' }
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
        borderColor: rgb(1, 0, 0)
      });
  
      this.addText('NOTA:', noteX + 20, noteY + 35, 11, rgb(1, 0, 0));
      this.addParagraph(
        ['En caso de respuesta afirmativa a alguna pregunta, indique el número de ésta e incluya',
          'el diagnóstico, fecha, duración, grado de recuperación y nombre/dirección de médicos a',
          'quienes se pueda pedir información.'],
        noteX + 55, noteY + 35
      );
  
      this.y -= noteHeight - 10;
    }

  /** 📌 Agrega la sección de preguntas de salud */
  private addHealthQuestions() {
    this.addText('2. ¿Ha sido tratado o tiene conocimiento de haber padecido de:', 20, this.y);
    this.y -= 15;
    this.addText('Sí', 520, this.y);
    this.addText('No', 540, this.y);
    this.y -= 15;

    const questions = [
      "a. Enfermedad o defecto de ojos, oídos, nariz o garganta?",
      "b. Mareos, desmayos, convulsiones, cefaleas, torpeza al hablar, parálisis o ataque cerebral?",
      "c. Dificultad al respirar, bronquitis, asma, neumonía?",
      "d. Dolor en el pecho, palpitaciones, hipertensión, soplo cardíaco?",
      "e. Ictericia, hernia, colitis, úlcera, hemorragias internas?",
      "f. Diabetes, enfermedad de los riñones, vejiga?",
      "g. Enfermedad de la tiroides o glándulas endocrinas?",
      "h. Reumatismo, artritis, gota, escoliosis?",
      "i. Alguna deformidad, cojera o amputación?",
      "j. Cáncer, tumores, linfomas?",
      "k. Alergias, anemia u otra enfermedad de la sangre?",
      "l. Consumo excesivo de alcohol?"
    ];

    questions.forEach((question) => {
      this.checkSpace();
      let lines = this.wrapText(question, 350);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * 12);
      });

      this.drawCheckboxWithOut(520, this.y);
      this.drawCheckboxWithOut(540, this.y);
     // this.drawBox(25, this.y - 10, 520, 30);

      this.y -= 50;
    });

    this.y -= 20;
       // 📌 **Pregunta 3: Consumo de tabaco**
    this.addQuestion3();
    this.addSignatureSection();
           // 📌 **Preguntas 4, 5 y 6**
    this.addQuestions456();
    this.addQuestion7()
    this.addQuestions8to9()
    this.addQuestion10()
    this.addQuestion11()
    this.addQuestion13()
    this.addQuestions15To17()
    this.addSignatureSection2()
  }

  /** 📌 Agrega la Pregunta 3: Consumo de Tabaco */
  private addQuestion3() {
    this.checkSpace();

    // **Texto de la pregunta 3**
    const questionText = 
      '3. ¿En la actualidad fuma usted o durante los últimos 12 meses ha fumado cigarrillos, cigarros, pipa o ha usado tabaco en cualquier forma?';
    let lines = this.wrapText(questionText, 480); // Ajustar ancho del texto

    lines.forEach((line, i) => {
      this.addText(line, 25, this.y - i * this.lineSpacing);
    });

    this.drawCheckboxWithOut(520, this.y);
    this.drawCheckboxWithOut(540, this.y);

    this.y -= this.lineSpacing * lines.length + 10;

    // **Subtexto para detallar cigarrillos al día**
    this.addText('(En caso afirmativo, detalle cuántos al día)', 25, this.y);
    this.page.drawLine({
      start: { x: 290, y: this.y + 5 },
      end: { x: 450, y: this.y + 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    this.y -= 20;
  }

   /** 📌 Agrega las Preguntas 4, 5 y 6 */
   private addQuestions456() {
    this.checkSpace();

    const questions = [
      "4. ¿Ha usado alguna vez drogas estupefacientes, a menos que fuera bajo consejo médico?",
      "5. ¿Está usted actualmente sometido a observación, tratamiento o medicación por alguna enfermedad?",
      "6. ¿Tiene usted la intención de buscar consejo médico, tratamiento o hacer cualquier prueba médica?"
    ];

    questions.forEach((question) => {
      this.checkSpace();

      // **Ajuste del texto si es muy largo**
      let lines = this.wrapText(question, 480);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * this.lineSpacing);
      });

      this.drawCheckboxWithOut(520, this.y);
      this.drawCheckboxWithOut(540, this.y);

      this.y -= this.lineSpacing * lines.length + 10;

      // **Línea para detallar información adicional en caso de respuesta afirmativa**
      this.page.drawLine({
        start: { x: 25, y: this.y + 5 },
        end: { x: 550, y: this.y + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      this.y -= 40;
    });
  }

   /** 📌 Agrega la Pregunta 7 */
   private addQuestion7() {
    this.checkSpace();

    // **Título de la Pregunta 7**
    this.addText('7. En los últimos 5 años:', 20, this.y, 10); // Rojo para destacar
    this.y -= this.lineSpacing + 5;

    // **Subpreguntas de la pregunta 7**
    const subQuestions = [
      "a. ¿Ha tenido alguna enfermedad física o mental aparte de las ya mencionadas?",
      "b. ¿Ha tenido alguna revisión, consulta, lesión u operación quirúrgica?",
      "c. ¿Ha sido paciente en hospital, clínica, sanatorio u otros establecimientos médicos?",
      "d. ¿Ha sido sometido a electrocardiograma, rayos X u otro tipo de análisis?",
      "e. ¿Se le ha aconsejado algún análisis, hospitalización u operación que no se hubiera realizado?"
    ];

    subQuestions.forEach((question) => {
      this.checkSpace();

      // **Dividir el texto en varias líneas si es demasiado largo**
      let lines = this.wrapText(question, 480);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * this.lineSpacing);
      });

      this.drawCheckboxWithOut(520, this.y);
      this.drawCheckboxWithOut(540, this.y);

      this.y -= this.lineSpacing * lines.length + 10; // Espacio entre preguntas
    });
  }

   /** 📌 Agrega las Preguntas 8 y 9 */
   private addQuestions8to9() {
    this.checkSpace();

    const questions = [
      "8. ¿Ha tenido aplazamiento, rechazo o reducción del servicio militar por deficiencia física o mental?",
      "9. ¿Ha solicitado o percibido alguna vez indemnización por incapacidad de cualquier tipo?"
    ];

    questions.forEach((question) => {
      this.checkSpace();
      let lines = this.wrapText(question, 480);
      lines.forEach((line, i) => {
        this.addText(line, 25, this.y - i * this.lineSpacing);
      });

      this.drawCheckboxWithOut(520, this.y);
      this.drawCheckboxWithOut(540, this.y);

      this.y -= this.lineSpacing * lines.length + 10;
    });
  }

   /** 📌 Agrega la Pregunta 10 con la tabla de antecedentes familiares */
   private addQuestion10() {
    this.checkSpace();

    // 📌 **Título de la pregunta**
    let questionLines = this.wrapText(
      "10. ¿Hay en su familia antecedentes de tuberculosis, diabetes, cáncer, hipertensión, enfermedad sanguínea o renal, enfermedad mental o suicidio?",
      460
    );

    questionLines.forEach((line, i) => {
      this.addText(line, 25, this.y - i * this.lineSpacing);
    });

    this.drawCheckboxWithOut(520, this.y);
    this.drawCheckboxWithOut(540, this.y);
    this.y -= this.lineSpacing * questionLines.length + 5;

    // 📌 **Encabezados de la tabla**
    const startX = 25;
    const colWidths = [100, 280, 80]; // Columnas: Edad si viven, Estado de salud, Edad al morir
    const headerY = this.y;

    this.addText("Edad si viven", startX+50, headerY, 9);
    this.addText("Estado de salud / Causa de muerte", startX + colWidths[0] + 20, headerY, 9);
    this.addText("Edad al morir", startX + colWidths[0] + colWidths[1] + 20, headerY, 9);

    // 📌 **Dibujar la línea del encabezado**
    this.page.drawLine({
      start: { x: startX, y: headerY - 5 },
      end: { x: startX + colWidths[0] + colWidths[1] + colWidths[2], y: headerY - 5 },
      thickness: 1
    });

    this.y -= this.lineSpacing;

    // 📌 **Datos de la tabla**
    const familyData = [
      ["Padre", "70", "Diabetes Muertos", ""],
      ["Madre", "68", "HTA", ""],
      ["Hermanos", "3", "Demás hermanos sanos", ""],
      ["N° vivo", "1", "Demás hermanos sanos", ""],
      ["N° muerto", "1", "Por accidente de tránsito", "20"]
    ];

    // 📌 **Dibujar las filas**
    familyData.forEach(([relation, age, health, deathAge]) => {
      this.addText(relation, startX, this.y);
      this.addText(age, startX + colWidths[0] - 20, this.y);
      
      // 📌 **Asegurar que el texto largo no se desborde**
      let wrappedHealth = this.wrapText(health, colWidths[1] - 10);
      wrappedHealth.forEach((line, i) => {
        this.addText(line, startX + colWidths[0] + 20, this.y - i * this.lineSpacing);
      });

      this.addText(deathAge, startX + colWidths[0] + colWidths[1] + 20, this.y);

      this.y -= this.lineSpacing * wrappedHealth.length + 5; // Espaciado extra
    });

    this.y -= 15;
  }
   /** 📌 Agrega la Pregunta 11 con estatura y peso */
   private addQuestion11() {
    this.checkSpace();

    this.addText("11. a. Estatura", 20, this.y);
    this.addText("1", 120, this.y);
    this.addText("(m)", 135, this.y);
    this.addText("82", 170, this.y);
    this.addText("(cm)", 190, this.y);
    this.y -= this.lineSpacing;

    this.addText("b. Peso", 25, this.y);
    this.addText("95", 120, this.y);
    this.addText("(kg)", 170, this.y);
    this.y -= this.lineSpacing + 5;

    // **Checkbox para respuesta Sí/No**
    this.addText("12. ¿Ha tenido algún cambio de peso en los últimos 12 meses?", 25, this.y);
    this.drawCheckboxWithOut(520, this.y);
    this.drawCheckboxWithOut(540, this.y);
    this.y -= this.lineSpacing + 10;
  }


  /** 📌 Agrega la Pregunta 13 sobre embarazo */
  private addQuestion13() {
    this.checkSpace();

    this.addText("13. SI EL PROPUESTO ASEGURADO ES MUJER", 20, this.y, 10);
    this.y -= this.lineSpacing;

    const subQuestions = [
      "a. A su mejor saber y entender",
      "    ¿Ha tenido alguna vez trastornos de la menstruación, pechos, aparato genital o alteraciones en el embarazo?",
      "b. ¿Está embarazada en la actualidad?",
      "    En caso afirmativo, ¿cuántos meses?"
    ];

    subQuestions.forEach((question, index) => {
      this.checkSpace();
      let xPosition = index % 2 === 0 ? 25 : 40;
      let lines = this.wrapText(question, 480);
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
    private addQuestions15To17() {
      this.checkSpace();
  
      const questions = [
        "14. ¿Ha recibido usted tratamiento o consejo médico en relación al SIDA o condiciones relacionadas con él, o en relación con enfermedades de transmisión sexual?",
        "15. ¿Le han dicho que ha tenido SIDA o el Complejo Relacionado al SIDA?",
        "16. ¿Ha tenido o le han informado que tiene pruebas sanguíneas positivas para anticuerpos del virus del SIDA?",
        "17. ¿Tiene usted alguno de estos síntomas sin explicación: fatiga, pérdida de peso, diarrea, ganglios linfáticos inflamados o extrañas lesiones en la piel?"
      ];
  
      questions.forEach((question) => {
        this.checkSpace();
  
        let wrappedLines = this.wrapText(question, 480); // Ajusta el texto al ancho
        wrappedLines.forEach((line, i) => {
          this.addText(line, 20, this.y - i * this.lineSpacing);
        });
  
        this.drawCheckboxWithOut(520, this.y); // Opción "Sí"
        this.drawCheckboxWithOut(540, this.y); // Opción "No"
  
        this.y -= this.lineSpacing * wrappedLines.length + 10; // Espaciado adicional
      });
  
      this.y -= 10; // Espacio antes de la siguiente sección
    }

  /** 📌 Agrega la sección de firma */
  private addSignatureSection() {
    this.checkSpace();
    this.drawBox(180, this.y, 240, 40);
    this.addText('Firma del Propuesto Asegurado', 220, this.y - 15);
    this.y -=60
  }

    /** 📌 Agrega la sección de firmas alineadas */
    private addSignatureSection2() {
      this.checkSpace();
      const startX = 100;
      const middleX = this.pageWidth / 2 + 30;
      const yPosition = this.y - 50;
  
      // 📌 Línea de "Firmado en..."
      this.addText('Firmado en', startX, yPosition);
      this.drawLine(startX + 50, yPosition, 80); // Espacio para la ciudad
      this.addText('el', startX + 140, yPosition);
      this.drawLine(startX + 160, yPosition, 30); // Espacio para el día
      this.addText('de', startX + 200, yPosition);
      this.drawLine(startX + 220, yPosition, 80); // Espacio para el mes
      this.addText('del 20', startX + 310, yPosition);
      this.drawLine(startX + 340, yPosition, 30); // Espacio para el año
  
      // 📌 Firma del Médico Examinador
      this.drawLine(startX, yPosition - 40, 180);
      this.addText('Firma del Médico Examinador', startX + 20, yPosition - 55);
      this.addText('MÉDICO - CIRUJANO', startX + 50, yPosition - 70);
      this.addText('C.M.P. _______', startX + 50, yPosition - 85);
      
      // 📌 Firma del Propuesto Asegurado
      this.drawLine(middleX, yPosition - 40, 180);
      this.addText('Firma del Propuesto Asegurado', middleX + 10, yPosition - 55);
      this.addText('Favor de consignar la firma de su D.N.I.', middleX - 10, yPosition - 70);
  
      this.y -= 100; // Ajustar espacio después de la sección
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
  private addText(text: string, x: number, y: number, size = 10, color = rgb(0, 0, 0)) {
    this.page.drawText(text, { x, y, size, font: this.font, color });
  }

  /** 📌 Agrega párrafos con ajuste de líneas */
  private addParagraph(lines: string[], x: number, y: number) {
    lines.forEach((line, index) => {
      this.page.drawText(line, { x, y: y - index * 12, size: 10, font: this.font });
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
    let lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let textWidth = this.font.widthOfTextAtSize(testLine, 10);

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
}
