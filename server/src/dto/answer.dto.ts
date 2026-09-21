import { IsNotEmpty, IsString } from "class-validator";

export class CreateAnswerDTO {
  @IsNotEmpty({ message: "Texto da resposta não pode estar vazio" })
  @IsString()
  text!: string;
}
