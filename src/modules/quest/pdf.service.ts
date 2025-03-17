import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './quest.entity';
import { CreateQuestDto } from './dtos/createQuest.dto';
import { User } from '../users/users.entity';
import { Catalog } from '../catalog/catalog.entity';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    @InjectRepository(Catalog) private catalogsRepository: Repository<Catalog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async generatePdf(): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    let y = height - 50;

    // 🎯 Logo y título
    page.drawText('PACÍFICO SEGUROS', { x: 20, y, size: 9, font, color: rgb(0, 0, 0.5) });
    y -= 15;    
    page.drawText('DECLARACIÓN ADICIONAL DE SALUD', { x: 20, y, size: 12, font, color: rgb(0, 0, 0) });
    page.drawLine({
        start: { x: 20, y: 774 }, // Punto de inicio (X, Y)
        end: { x: 565, y: 774 }, // Punto de fin (X, Y)
        thickness: 1, // Grosor de la línea
        color: rgb(0, 0, 0), // Color negro
      });
    //y -= 15;
    //page.drawText('Parte II', { x: 20, y, size: 11, font });

   // y -= 15;
    // 🎯 Datos del asegurado

    //this.drawBox(page, 50, y, 500, 80); // 📌 Cuadro general
    this.drawText(page,'Parte II',20, y - 15,font)
    this.drawText(page,'Nº Solicitud',350, y - 15,font)
    this.drawText(page,'SOLI000001',450, y - 15,font)

    this.drawText(page,'Declaraciones hechas al médico',20,y-30,font)
    this.drawText(page,'Asesor',350,y-30,font)
    this.drawText(page,'FRANK ROCHA HORNA',450,y-30,font)

    this.drawText(page,'Propusto Asegurado',20,y-45,font)
    this.drawText(page,'JOHAN ROCHA HORNA',120,y-45,font)
    this.drawText(page,'Fecha de Nacimiento',350,y-45,font)
    this.drawText(page,'21/08/1998',450,y-45,font)

     y -= 46;
    // 🎯 Estado civil
    const checkboxes = [
        { label: 'Soltero', x: 20, checked: false },
        { label: 'Casado', x: 90, checked: true },  // ✅ Marcar Casado
        { label: 'Divorciado', x: 160, checked: false },
        { label: 'Viudo', x: 240, checked: false },
        { label: 'Separado', x: 300, checked: false },
      ];
  
      checkboxes.forEach((item) => {
        this.drawCheckbox(page, item.x, y - 5, item.label, item.checked, font);
      });

      this.drawText(page,'D.N.I. Nº',400,y-15,font)
      this.drawText(page,'74047141',450,y-15,font)

      y -= 15;
      this.drawText(page,'INSTRUCCIONES PARA EL MÉDICO EXAMINADOR',150,y-20,font)
      y -= 30;
    // 🔹 Cuadro para las instrucciones
    this.drawBox(page, 20, y, 560, 120);
    this.drawText(page, '1. Una vez comenzado el examen, el informe correspondiente pasa a ser propiedad de la Compañía y', 25, y - 15, font);
    this.drawText(page, '   no debe ser alterado o destruido cualquiera sea el dictamen, incluso si el Propuesto Asegurado', 25, y - 30, font);
    this.drawText(page, '   u otra persona se ofrecen a pagar sus honorarios.', 25, y - 45, font);
    this.drawText(page, '2. No se permite al M.E. examinar a sus pacientes o familiares, o a los clientes de un familiar suyo.', 25, y - 60, font);
    this.drawText(page, '3. El Propuesto Asegurado debe poner su firma en cualquier alteración en las declaraciones hechas por él.', 25, y - 75, font);
    this.drawText(page, '4. Tanto las declaraciones del Propuesto Asegurado como su informe deben ser registradas a mano por usted.', 25, y - 90, font);
    this.drawText(page, '5. Si está usando sistema métrico para la medida, indíquelo.', 25, y - 105, font);

    y -= 140;

    // 🔹 Sección: "POR FAVOR, CONTESTE A SU MEJOR SABER Y ENTENDER"
    this.drawText(page, 'POR FAVOR, CONTESTE A SU MEJOR SABER Y ENTENDER', 150, y, font);
    y -= 10;
   // this.drawBox(page, 20, y, 560, 95);

    this.drawText(page, '1. a. ¿Nombre y dirección de su médico particular?', 25, y - 15, font);
    this.drawText(page, '(Si no tiene, último médico consultado)', 25, y - 30, font);
    //this.drawBox(page, 250, y - 10, 320, 20);
    this.drawText(page, 'Dr. Acosta - Clínica Internacional (Endocrinólogo)', 260, y - 15, font);

    this.drawText(page, 'b. ¿Fecha y motivo de la consulta más reciente?', 25, y - 50, font);
    this.drawText(page, '(Si fue dentro de los últimos 10 años)', 25, y - 65, font);
    //this.drawBox(page, 250, y - 45, 320, 20);
    this.drawText(page, 'Hace 1 mes (control mensual de Diabetes)', 260, y - 50, font);

    this.drawText(page, 'c. ¿Qué tratamiento o medicación se prescribió?', 25, y - 85, font);
    //this.drawBox(page, 250, y - 80, 320, 20);
    this.drawText(page, 'Metformina 850 1tab/d. + Atorvastatina 20mg 1tab/d.', 260, y - 85, font);  

    y -= 110;

    // 🔹 Cuadro de advertencia "OJO"
    const boxWidth = 500;
    const boxX = (width - boxWidth) / 2; // Centrar el cuadro
    const boxHeight = 42;

    // Dibujar el cuadro con borde rojo
    page.drawRectangle({
        x: boxX,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderWidth: 1.5,
        borderColor: rgb(1, 0, 0), // Rojo
    });

    // Texto de "OJO" en rojo
    page.drawText('NOTA:', { x: boxX + 8, y: y - 15, size: 11, font, color: rgb(1, 0, 0) });

    // Texto dentro del cuadro
    const textX = boxX + 45;
    const textY = y - 15;
    this.drawText(
        page,
        'En caso de respuesta afirmativa a alguna pregunta, indique el número de ésta e incluya',
        textX,
        textY,
        font
    );
    this.drawText(
        page,
        'el diagnóstico, fecha, duración, grado de recuperación y nombre/dirección de médicos a',
        textX,
        textY - 12,
        font
    );
    this.drawText(
        page,
        'quienes se pueda pedir información.',
        textX,
        textY - 24,
        font
    );

    y -= 60;

    // 🔹 Sección: Preguntas con espacio para comentarios
    this.drawText(page, '2. ¿Ha sido tratado o tiene conocimiento de haber padecido de:', 20, y, font);
    y -= 10;
    //this.drawBox(page, 20, y, 555, 200); // 📌 Cuadro que ocupa todo el ancho

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

    let questionY = y - 15;

    questions.forEach((question, index) => {
        this.drawText(page, `${question}`, 25, questionY, font);

        // Dibujar checkboxes para SÍ y NO
        this.drawCheckbox(page, 520, questionY, "Sí", false, font);
        this.drawCheckbox(page, 550, questionY, "No", true, font);

        // Espacio para comentarios debajo de la pregunta
       // this.drawBox(page, 25, questionY - 20, 520, 15);

        questionY -= 40; // Ajusta el espacio entre preguntas
    });

    y = questionY - 20;

    // 🔹 Firma del asegurado
    this.drawBox(page, 180, y, 240, 40);
    this.drawText(page, 'Firma del Propuesto Asegurado', 220, y - 15, font);


    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private drawCheckbox(page, x, y, label, checked, font) {
    const boxSize = 12;

    // Dibujar cuadrado del checkbox
    page.drawRectangle({
      x,
      y: y - boxSize,
      width: boxSize,
      height: boxSize,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    // Marcar el checkbox si está seleccionado
    if (checked) {
      page.drawText('X', { x: x + 2, y: y - 10, size: 12, font, color: rgb(0, 0, 0) });
    }

    // Dibujar el texto del checkbox
    page.drawText(label, { x: x + 20, y: y - 11, size: 11, font });
  }

  // 📌 Método para dibujar cuadros
  private drawBox(page, x, y, width, height) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
  }

  // 📌 Método para escribir texto
  private drawText(page, text, x, y, font) {
    page.drawText(text, { x, y, size: 10, font });
  }

}