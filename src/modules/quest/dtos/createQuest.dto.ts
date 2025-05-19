import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateQuestDto {
  /**
   * debe ser un string de 1 caracter (3 - asegurabilidad, 4 - covid)
   * @example '3'
   */
  @IsNotEmpty()
  @IsString()
  @Length(1, 1, {
    message: 'El codigo de questionario debe tener entre 1 y 2 caracteres',
  })
  questType: string;
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
  @Length(8, 20, {
    message: 'Documento del paciente debe tener entre 8 y 20 caracteres',
  })
  patientDni: string;
  /**
   * nombre del pdf debe tener entre 20 y 50 caracteres
   * @example '12.01.2025-CASEG-JDOMINGUEZA'
   */

  @IsNotEmpty()
  @IsString()
  @Length(5, 100, {
    message: 'nombre del pdf debe tener entre 5 y 100 caracteres',
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
