import { IsEnum, IsNotEmpty } from "class-validator";
import { ReactionType } from "../entities/reaction.enum";

export class CreateReactionDto {
  @IsNotEmpty({ message: "O tipo de reação não pode estar vazio." })
  @IsEnum(ReactionType, {
    message: "O tipo de reação deve ser 'like' ou 'dislike'.",
  })
  type!: ReactionType;
}