import { IsArray, IsIn, IsNotEmpty, IsString, ArrayMinSize, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class SupportMessageItemDTO {
	@IsIn(["user", "assistant"], {
		message: "O papel da mensagem deve ser 'user' ou 'assistant'.",
	})
	role!: "user" | "assistant"

	@IsNotEmpty({ message: "O conteúdo da mensagem não pode estar vazio." })
	@IsString({ message: "O conteúdo da mensagem deve ser uma string." })
	content!: string
}

export class SendSupportMessageDTO {
	@IsArray({ message: "O campo messages deve ser um array." })
	@ArrayMinSize(1, { message: "É necessário pelo menos uma mensagem." })
	@ValidateNested({ each: true })
	@Type(() => SupportMessageItemDTO)
	messages!: SupportMessageItemDTO[]
}
