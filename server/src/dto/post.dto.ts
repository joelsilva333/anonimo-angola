import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDTO {
  @IsNotEmpty({ message: "O texto da publicação não pode estar vazio." })
  @IsString({ message: "O texto da publicação deve ser uma string." })
  text!: string;
}

export class UpdatePostDTO {
  @IsOptional()
  @IsString({ message: "O texto da publicação deve ser uma string." })
  text?: string;

  @IsOptional()
  @IsString({ message: "O status deve ser uma string válida: 'active', 'deleted' ou 'flagged'." })
  status?: "active" | "deleted" | "flagged";
}
