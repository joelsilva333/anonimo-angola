import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

/** Só minúsculas, números e "_", 5-24 caracteres, com pelo menos um número. */
const ANON_NAME_PATTERN = /^(?=.*\d)[a-z0-9_]{5,24}$/;
const ANON_NAME_PATTERN_MESSAGE =
  "O nome deve ter 5-24 caracteres, apenas minúsculas/números/_, com pelo menos um número";

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @Matches(ANON_NAME_PATTERN, { message: ANON_NAME_PATTERN_MESSAGE })
  anon_name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password!: string;

  @IsString()
  @MaxLength(15)
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  role?: "user" | "admin" | "anonymous";

  /**
   * Só é obrigatório se `phone_number` for enviado (regista logo o
   * telefone verificado). A conta pode ser criada sem telefone — ele serve
   * apenas para recuperação e pode ser adicionado depois.
   */
  @IsOptional()
  @IsString()
  firebase_token?: string;

  /**
   * ID token do Firebase de uma sessão "Sign in with Google", opcional.
   * Se enviado, a conta fica vinculada ao Google já na criação (nunca se
   * guarda email/nome/foto do Google, apenas um hash irreversível do UID).
   */
  @IsOptional()
  @IsString()
  google_token?: string;
}

export class CompleteOnboardingDTO {
  @IsNotEmpty({ message: "O nome anónimo é obrigatório" })
  @IsString()
  @Matches(ANON_NAME_PATTERN, { message: ANON_NAME_PATTERN_MESSAGE })
  anon_name!: string;
}

export class AddPhoneDTO {
  @IsNotEmpty({ message: "O número de telefone é obrigatório" })
  @IsString()
  @MaxLength(15)
  phone_number!: string;

  @IsNotEmpty({ message: "O token do Firebase é obrigatório" })
  @IsString()
  firebase_token!: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @Matches(ANON_NAME_PATTERN, { message: ANON_NAME_PATTERN_MESSAGE })
  anon_name!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  profile_picture!: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password_hash!: string;

  /** Obrigatória quando o próprio utilizador (não admin) muda a sua palavra-passe. */
  @IsOptional()
  @IsString()
  current_password?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone_number?: string;

  @IsOptional()
  @IsBoolean()
  notify_likes?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_comments?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_follows?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_messages?: boolean;
}
