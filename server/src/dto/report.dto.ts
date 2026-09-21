import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export const REPORT_REASONS = [
  "Spam ou publicidade",
  "Conteúdo ofensivo ou discurso de ódio",
  "Assédio ou bullying",
  "Informação falsa",
  "Conteúdo sexual ou impróprio",
  "Outro",
];

export class CreateReportDto {
  @IsNotEmpty({ message: "O motivo da denúncia é obrigatório." })
  @IsString()
  @IsIn(REPORT_REASONS, { message: "Motivo de denúncia inválido." })
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "A descrição não pode ultrapassar 500 caracteres." })
  details?: string;
}
