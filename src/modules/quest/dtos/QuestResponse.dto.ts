import { Expose } from 'class-transformer';

export class QuestResponseDto {
  @Expose()
  patientName: string;

  @Expose()
  patientDni: string;

  @Expose()
  pdfName: string;

  @Expose()
  jsonQuest: string;

  @Expose()
  status: string;
}
