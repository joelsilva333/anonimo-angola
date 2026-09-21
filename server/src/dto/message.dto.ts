import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SendMessageDTO {
  @IsNotEmpty({ message: "A mensagem não pode estar vazia" })
  @IsString()
  @MaxLength(2000, { message: "A mensagem não pode ter mais de 2000 caracteres" })
  text!: string;
}
