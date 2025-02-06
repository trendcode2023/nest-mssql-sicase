import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateQuestDto {
  /**
   * nombre del paciente debe tener entre 5 y 125 caracteres
   * @example 'Juan Alberto Dominguez Alvarado'
   */
  @IsNotEmpty()
  @IsString()
  @Length(5, 125, {
    message: 'nombre del paciente debe tener entre 5 y 125 caracteres',
  })
  patientName: string;

  /**
   * nombre del pdf debe tener entre 30 y 50 caracteres
   * @example '12-01-2025 CASEG JDOMINGUEZA'
   */

  @IsNotEmpty()
  @IsString()
  @Length(30, 50, {
    message: 'nombre del pdf debe tener entre 30 y 50 caracteres',
  })
  pdfName: string;

  /**
   * aqui va el json
   * @example '{codigo:'001', nombre:'abcd', questions:[{id:1,question:'tienes covid?'}]}'
   */

  @IsNotEmpty()
  @IsString()
  jsonQuest: string;
}
