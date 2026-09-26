import {
  AuthLoginDTO,
  GoogleAuthDTO,
  RequestPasswordResetDTO,
  ResetPasswordWithOtpDTO,
} from "../dto/auth.dto";
import { AddPhoneDTO, CreateUserDTO } from "../dto/user.dto";
import { User } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";
import { getRandomAvatar } from "../utils/random-avatar";
import { encrypt, decrypt, hashGoogleId } from "../utils/crypto";
import aiService from "./ai.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { firebaseAuth } from "../config/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { AccountSuspendedError } from "../utils/errors";

type AuthUserResponse = Partial<User> & { google_linked?: boolean };

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 9) {
      return `+244${cleaned}`;
    }
    return cleaned.startsWith("244") ? `+${cleaned}` : `+244${cleaned}`;
  }

  async register(
    input: CreateUserDTO,
  ): Promise<{ user: AuthUserResponse; token: string }> {
    // A verificação do telefone NUNCA bloqueia a criação da conta — o
    // telefone só serve para recuperação e é opcional aqui. Se for
    // enviado, exige-se prova de verificação por Firebase; caso contrário
    // a conta nasce sem telefone e pode adicionar-se um depois.
    if (input.phone_number) {
      if (!input.firebase_token) {
        throw new Error(
          "É necessário verificar o número por SMS antes de o associar",
        );
      }

      const decodedToken = await getAuth().verifyIdToken(input.firebase_token);

      if (!decodedToken.phone_number) {
        throw new Error("Telefone não verificado pelo Firebase");
      }

      if (decodedToken.phone_number !== input.phone_number) {
        throw new Error(
          "O número de telefone não corresponde ao token de verificação",
        );
      }
    }

    if (!input.anon_name || input.anon_name.trim().length === 0) {
      throw new Error("Nome de usuário não pode estar vazio");
    }

    if (!input.password) {
      throw new Error("Senha obrigatória");
    }

    if (input.password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    if (input.anon_name.length < 5 || input.anon_name.length > 24) {
      throw new Error("Nome de usuário deve ter entre 5 e 24 caracteres");
    }

    if (input.phone_number && input.phone_number.length > 13) {
      throw new Error("Número de telefone não pode ter mais de 13 caracteres");
    }

    if (input.role && !["user", "admin", "anonymous"].includes(input.role)) {
      throw new Error("Função de usuário inválida");
    }

    const nameCheck = await aiService.checkAnonymousName(input.anon_name);
    if (!nameCheck.anonymous) {
      throw new Error(
        nameCheck.reason ||
          "Este nome parece identificar-te. Escolhe um pseudónimo mais genérico.",
      );
    }

    const existingUser = await this.userRepository.findByAnonName(
      input.anon_name,
    );

    if (existingUser) {
      throw new Error("Usuário já existe");
    }

    let encryptedPhone = "";

    if (input.phone_number) {
      const existingPhone = await this.userRepository.findByPhoneNumber(
        input.phone_number,
      );

      if (existingPhone) {
        throw new Error("Número de telefone já em uso");
      }

      encryptedPhone = encrypt(input.phone_number);
    }

    // Se vier acompanhado de uma sessão Google, valida e vincula já na
    // criação — falha antes de criar a conta para não deixar um perfil
    // "órfão" sem o vínculo que a pessoa pediu.
    let googleIdHash: string | null = null;
    if (input.google_token) {
      googleIdHash = await this.verifyGoogleToken(input.google_token);

      const existingGoogleLink =
        await this.userRepository.findByGoogleIdHash(googleIdHash);
      if (existingGoogleLink) {
        throw new Error("Esta conta Google já está vinculada a outro perfil");
      }
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:8080/public";
    const profilePicture = getRandomAvatar();

    const user = new User();
    user.anon_name = input.anon_name;
    user.profile_picture = `${baseUrl}${profilePicture}`;
    user.password_hash = await bcrypt.hash(input.password, 10);
    user.phone_number = encryptedPhone;
    user.role = input.role || "user";
    user.google_id_hash = googleIdHash;
    user.onboarding_completed = true;

    const createdUser = await this.userRepository.create(user);

    const decryptedPhone = createdUser.phone_number
      ? decrypt(createdUser.phone_number)
      : "";

    const token = jwt.sign(
      {
        id: createdUser.id,
        anon_name: createdUser.anon_name,
        role: createdUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "12h" },
    );

    return {
      user: {
        id: createdUser.id,
        anon_name: createdUser.anon_name,
        phone_number: decryptedPhone,
        profile_picture: createdUser.profile_picture,
        is_active: createdUser.is_active,
        role: createdUser.role,
        google_linked: !!createdUser.google_id_hash,
        onboarding_completed: createdUser.onboarding_completed,
        notify_likes: createdUser.notify_likes,
        notify_comments: createdUser.notify_comments,
        notify_follows: createdUser.notify_follows,
        notify_messages: createdUser.notify_messages,
        anonymous_mode: createdUser.anonymous_mode,
        comment_permission: createdUser.comment_permission,
        dm_permission: createdUser.dm_permission,
      },
      token,
    };
  }

  async login(
    input: AuthLoginDTO,
  ): Promise<{ user: AuthUserResponse; token: string }> {
    const user = await this.userRepository.findByAnonName(input.anon_name);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const validPassword = await bcrypt.compare(
      input.password,
      user.password_hash,
    );

    if (!validPassword) {
      throw new Error("Senha incorreta");
    }

    if (!user.is_active) {
      throw new AccountSuspendedError(
        user.banned_reason || "Esta conta está suspensa.",
      );
    }

    user.last_login_at = new Date();
    await this.userRepository.update(user);

    const token = jwt.sign(
      { id: user.id, anon_name: user.anon_name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "12h" },
    );

    const decryptedPhone = user.phone_number ? decrypt(user.phone_number) : "";

    return {
      user: {
        id: user.id,
        anon_name: user.anon_name,
        phone_number: decryptedPhone,
        profile_picture: user.profile_picture,
        is_active: user.is_active,
        role: user.role,
        google_linked: !!user.google_id_hash,
        onboarding_completed: user.onboarding_completed,
        notify_likes: user.notify_likes,
        notify_comments: user.notify_comments,
        notify_follows: user.notify_follows,
        notify_messages: user.notify_messages,
        anonymous_mode: user.anonymous_mode,
        comment_permission: user.comment_permission,
        dm_permission: user.dm_permission,
      },
      token,
    };
  }

  async validateUserForReset(
    input: RequestPasswordResetDTO,
  ): Promise<{ message: string }> {
    if (!input.phone_number) {
      throw new Error("Número de telefone é obrigatório");
    }

    const normalizedPhone = this.normalizePhoneNumber(input.phone_number);
    const user = await this.userRepository.findByPhoneNumber(normalizedPhone);

    if (!user) {
      return {
        message: "Se o número estiver registado, um código será enviado.",
      };
    }

    return { message: "Utilizador validado com sucesso." };
  }

  async resetPasswordWithOtp(
    input: ResetPasswordWithOtpDTO,
  ): Promise<{ success: boolean }> {
    if (!input.phone_number || !input.firebase_token || !input.new_password) {
      throw new Error("Dados insuficientes para redefinir a palavra-passe");
    }

    if (input.new_password.length < 6) {
      throw new Error("A nova senha deve ter pelo menos 6 caracteres");
    }

    let decodedToken;

    try {
      decodedToken = await firebaseAuth.verifyIdToken(input.firebase_token);
    } catch (error) {
      throw new Error("Código OTP ou token inválido/expirado");
    }

    const verifiedPhoneNumber = decodedToken.phone_number;

    if (
      !verifiedPhoneNumber ||
      !verifiedPhoneNumber.includes(input.phone_number.trim())
    ) {
      throw new Error(
        "O número de telefone validado não coincide com o solicitado",
      );
    }

    const normalizedPhone = this.normalizePhoneNumber(input.phone_number);

    const user = await this.userRepository.findByPhoneNumber(normalizedPhone);

    if (!user) {
      throw new Error("Utilizador não encontrado no sistema");
    }

    const saltRounds = 10;
    user.password_hash = await bcrypt.hash(input.new_password, saltRounds);

    await this.userRepository.update(user);

    return { success: true };
  }

  /**
   * Verifica um token do Firebase resultante de um "Sign in with Google" e
   * devolve o hash irreversível do UID da conta Google — nunca o email,
   * nome ou foto, para que o anonimato seja preservado mesmo para nós.
   */
  private async verifyGoogleToken(firebaseToken: string): Promise<string> {
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(firebaseToken);
    } catch {
      throw new Error("Token do Google inválido ou expirado");
    }

    const isGoogleSignIn =
      decodedToken.firebase?.sign_in_provider === "google.com" ||
      !!decodedToken.firebase?.identities?.["google.com"];

    if (!isGoogleSignIn) {
      throw new Error("O token fornecido não é de uma sessão Google válida");
    }

    return hashGoogleId(decodedToken.uid);
  }

  /**
   * Vincula uma conta Google a um utilizador já autenticado, para permitir
   * um login rápido no futuro. Nunca guarda dados identificáveis do Google.
   */
  async linkGoogleAccount(
    userId: string,
    input: GoogleAuthDTO,
  ): Promise<{ message: string }> {
    const googleIdHash = await this.verifyGoogleToken(input.firebase_token);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const existingLink =
      await this.userRepository.findByGoogleIdHash(googleIdHash);
    if (existingLink && existingLink.id !== user.id) {
      throw new Error("Esta conta Google já está vinculada a outro perfil");
    }

    user.google_id_hash = googleIdHash;
    await this.userRepository.update(user);

    return { message: "Conta Google vinculada com sucesso" };
  }

  /**
   * Login rápido através de uma conta Google já vinculada. Se nenhuma
   * conta anónima tiver essa conta Google vinculada, falha — a pessoa deve
   * criar/vincular a conta primeiro, mantendo o processo sempre anónimo.
   */
  /**
   * Login rápido com Google. Se ainda não existir nenhuma conta vinculada
   * a esta conta Google, cria uma na hora (sem senha, sem telefone) — a
   * entrada nunca fica bloqueada por passos de verificação. O nome
   * temporário atribuído fica marcado com `onboarding_completed: false`,
   * para o frontend forçar a escolha de um nome anónimo definitivo antes
   * de deixar usar o resto da app.
   */
  async loginWithGoogle(
    input: GoogleAuthDTO,
  ): Promise<{ user: AuthUserResponse; token: string; created: boolean }> {
    const googleIdHash = await this.verifyGoogleToken(input.firebase_token);

    let user = await this.userRepository.findByGoogleIdHash(googleIdHash);
    let created = false;

    if (!user) {
      const baseUrl = process.env.BASE_URL || "http://localhost:8080/public";
      const profilePicture = getRandomAvatar();

      let anon_name = "google_" + Math.random().toString(36).slice(2, 9);
      while (await this.userRepository.findByAnonName(anon_name)) {
        anon_name = "google_" + Math.random().toString(36).slice(2, 9);
      }

      const newUser = new User();
      newUser.anon_name = anon_name;
      newUser.profile_picture = `${baseUrl}${profilePicture}`;
      newUser.password_hash = "";
      newUser.phone_number = "";
      newUser.role = "user";
      newUser.google_id_hash = googleIdHash;
      newUser.onboarding_completed = false;

      user = await this.userRepository.create(newUser);
      created = true;
    }

    if (!user.is_active) {
      throw new AccountSuspendedError(
        user.banned_reason || "Esta conta está suspensa.",
      );
    }

    user.last_login_at = new Date();
    await this.userRepository.update(user);

    const token = jwt.sign(
      { id: user.id, anon_name: user.anon_name, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "12h" },
    );

    return {
      user: {
        id: user.id,
        anon_name: user.anon_name,
        profile_picture: user.profile_picture,
        is_active: user.is_active,
        role: user.role,
        google_linked: true,
        onboarding_completed: user.onboarding_completed,
        notify_likes: user.notify_likes,
        notify_comments: user.notify_comments,
        notify_follows: user.notify_follows,
        notify_messages: user.notify_messages,
        anonymous_mode: user.anonymous_mode,
        comment_permission: user.comment_permission,
        dm_permission: user.dm_permission,
      },
      token,
      created,
    };
  }

  /**
   * Passo final do onboarding para contas criadas via Google: define o
   * nome anónimo definitivo (valida formato + verificação de anonimato
   * por IA) e desbloqueia o resto da app.
   */
  async completeOnboarding(
    userId: string,
    anonName: string,
  ): Promise<AuthUserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (anonName.length < 5 || anonName.length > 24) {
      throw new Error("Nome de usuário deve ter entre 5 e 24 caracteres");
    }

    const nameCheck = await aiService.checkAnonymousName(anonName);
    if (!nameCheck.anonymous) {
      throw new Error(
        nameCheck.reason ||
          "Este nome parece identificar-te. Escolhe um pseudónimo mais genérico.",
      );
    }

    const existingUser = await this.userRepository.findByAnonName(anonName);
    if (existingUser && existingUser.id !== user.id) {
      throw new Error("Este nome já está em uso");
    }

    user.anon_name = anonName;
    user.onboarding_completed = true;
    const updatedUser = await this.userRepository.update(user);

    return {
      id: updatedUser.id,
      anon_name: updatedUser.anon_name,
      profile_picture: updatedUser.profile_picture,
      is_active: updatedUser.is_active,
      google_linked: !!updatedUser.google_id_hash,
      onboarding_completed: updatedUser.onboarding_completed,
    };
  }

  /**
   * Associa/verifica um número de telefone de recuperação a uma conta já
   * existente (ex.: criada via Google, sem telefone). Nunca é obrigatório
   * para usar a app — só é preciso se a pessoa quiser garantir que
   * consegue recuperar a conta.
   */
  async addPhoneNumber(userId: string, input: AddPhoneDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(input.firebase_token);
    } catch {
      throw new Error("Código OTP ou token inválido/expirado");
    }

    if (
      !decodedToken.phone_number ||
      !decodedToken.phone_number.includes(input.phone_number.trim())
    ) {
      throw new Error(
        "O número de telefone validado não coincide com o solicitado",
      );
    }

    const normalizedPhone = this.normalizePhoneNumber(input.phone_number);
    const existingPhone =
      await this.userRepository.findByPhoneNumber(normalizedPhone);
    if (existingPhone && existingPhone.id !== user.id) {
      throw new Error("Este número já está associado a outra conta");
    }

    user.phone_number = encrypt(normalizedPhone);
    await this.userRepository.update(user);
  }

  async loginAsGuest(): Promise<{ user: Partial<User>; token: string }> {
    const baseUrl = process.env.BASE_URL || "http://localhost:8080/public";
    const profilePicture = getRandomAvatar();

    let anon_name = "Anônimo" + Math.floor(Math.random() * 100000);
    while (await this.userRepository.findByAnonName(anon_name)) {
      anon_name = "Anônimo" + Math.floor(Math.random() * 100000);
    }

    const user = new User();
    user.anon_name = anon_name;
    user.profile_picture = `${baseUrl}${profilePicture}`;
    user.password_hash = "";
    user.phone_number = "";
    user.role = "anonymous";
    user.is_active = true;

    const createdUser = await this.userRepository.create(user);

    const token = jwt.sign(
      {
        id: createdUser.id,
        anon_name: createdUser.anon_name,
        role: "anonymous",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "12h" },
    );

    return {
      user: {
        id: createdUser.id,
        anon_name: createdUser.anon_name,
        profile_picture: createdUser.profile_picture,
        is_active: createdUser.is_active,
        created_at: createdUser.created_at,
      },
      token,
    };
  }
}
