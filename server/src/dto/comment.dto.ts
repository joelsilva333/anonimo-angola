import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentDTO {
  @IsNotEmpty({ message: "Texto do comentário não pode ser vazio" })
  @IsString()
  text!: string;
}

export class UpdateCommentDTO {
  @IsOptional()
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  @IsIn(["active", "deleted", "flagged"], {
    message: "Status inválido. Deve ser 'active', 'deleted' ou 'flagged'",
  })
  status!: "active" | "deleted" | "flagged";
}
