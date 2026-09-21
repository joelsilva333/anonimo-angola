import { IsNotEmpty, IsString, MinLength, MaxLength, Length } from "class-validator";

export class AuthLoginDTO {
  @IsNotEmpty({ message: "O nome anônimo não pode ser vazio" })
  @IsString()
  @MinLength(5)
  @MaxLength(12)
  anon_name!: string;

  @IsNotEmpty({ message: "A palavra-passe não pode estar vazia" })
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password!: string;
}

export class RequestPasswordResetDTO {
  @IsNotEmpty({ message: "O número de telefone é obrigatório" })
  @IsString()
  phone_number!: string;
}

export class GoogleAuthDTO {
  @IsNotEmpty({ message: "O token do Google é obrigatório" })
  @IsString()
  firebase_token!: string;
}

export class ResetPasswordWithOtpDTO {
  @IsNotEmpty({ message: "O número de telefone é obrigatório" })
  @IsString()
  phone_number!: string;

  @IsNotEmpty({ message: "O token do Firebase é obrigatório" })
  @IsString()
  firebase_token!: string;

  @IsNotEmpty({ message: "A nova senha é obrigatória" })
  @IsString()
  @Length(6, 20, { message: "A senha deve ter entre 6 e 20 caracteres" })
  new_password!: string;
}