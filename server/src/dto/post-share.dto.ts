import { IsNotEmpty, IsUUID, IsString, IsIn } from "class-validator";

export class CreatePostShareDto {
  @IsNotEmpty({ message: "O ID do post é obrigatório." })
  @IsUUID("4", { message: "O ID do post deve ser um UUID válido." })
  postId!: string;

  @IsNotEmpty({ message: "A plataforma de destino é obrigatória." })
  @IsString()
  @IsIn(["facebook", "instagram", "linkedin", "whatsapp", "link"], {
    message:
      "Plataforma inválida. Escolha entre Facebook, Instagram, Linkedin, Whatsapp ou link.",
  })
  platform!: string;
}
