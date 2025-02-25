import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateQuestDto {
  /**
   * nombre del paciente debe tener entre 5 y 100 caracteres
   * @example 'Juan Alberto Dominguez Alvarado'
   */
  @IsNotEmpty()
  @IsString()
  @Length(5, 100, {
    message: 'nombre del paciente debe tener entre 5 y 100 caracteres',
  })
  patientName: string;

  /**
   * dni del paciente debe tener 8 caracteres
   * @example '05236589'
   */
  @IsNotEmpty()
  @IsString()
  @Length(8, 8, {
    message: 'dni del paciente debe 8 caracteres',
  })
  patientDni: string;
  /**
   * nombre del pdf debe tener entre 20 y 50 caracteres
   * @example '12.01.2025-CASEG-JDOMINGUEZA'
   */

  @IsNotEmpty()
  @IsString()
  @Length(20, 50, {
    message: 'nombre del pdf debe tener entre 30 y 50 caracteres',
  })
  pdfName: string;

  /**
   * cuestionario en formato json
   * @example '{codigo:'001', nombre:'abcd', questions:[{id:1,question:'tienes covid?'}]}'
   */

  @IsNotEmpty()
  @IsString()
  jsonQuest: string;
}
