import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestDto } from './createQuest.dto';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateQuestDto {
  @IsOptional()
  @IsString()
  @Length(1, 1)
  questType?: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 100, {
    message: 'nombre del paciente debe tener entre 5 y 100 caracteres',
  })
  patientName?: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20, {
    message: 'Documento del paciente debe tener entre 8 y 20 caracteres',
  })
  patientDni?: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 100, {
    message: 'nombre del pdf debe tener entre 5 y 100 caracteres',
  })
  pdfName?: string;

  @IsOptional()
  @IsString()
  jsonQuest?: string;
}
