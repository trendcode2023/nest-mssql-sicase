import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestDto } from './createQuest.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateQuestDto {
    @IsOptional()
    @IsString()
    @Length(1, 1)
    questType?: string;
  
    @IsOptional()
    @IsString()
    @Length(5, 100)
    patientName?: string;
  
    @IsOptional()
    @IsString()
    @Length(8, 8)
    patientDni?: string;
  
    @IsOptional()
    @IsString()
    @Length(20, 50)
    pdfName?: string;
  
    @IsOptional()
    @IsString()
    jsonQuest?: string;
  }
  