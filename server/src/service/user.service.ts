import { User } from "../entities/user.entity";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { UpdateUserDTO } from "../dto/user.dto";
import { encrypt, decrypt } from "../utils/crypto";
import aiService from "./ai.service";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findById(
    id: string,
    loggedUserId?: string,
    loggedUserRole?: string,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    if (loggedUserId === user.id || loggedUserRole === "admin") {
      if (user.phone_number) {
        try {
          user.phone_number = decrypt(user.phone_number);
        } catch (error) {
          console.error("Erro ao descriptografar telefone:", error);
        }
      }
    } else {
      const { phone_number, password_hash, google_id_hash, ...safeUser } =
        user;
      return safeUser;
    }

    const { password_hash, google_id_hash, ...safeUser } = user;

    return safeUser;
  }

  async find(
    loggedUserId?: string,
    loggedUserRole?: string,
  ): Promise<
    {
      id: string;
      anon_name: string;
      phone_number?: string;
      profile_picture: string;
      created_at: Date;
      is_active: boolean;
    }[]
  > {
    const users = await this.userRepository.findAll();

    return users.map((user) => {
      const isOwnerOrAdmin =
        loggedUserId === user.id || loggedUserRole === "admin";
      let decryptedPhone: string | undefined = undefined;

      if (isOwnerOrAdmin && user.phone_number) {
        try {
          decryptedPhone = decrypt(user.phone_number);
        } catch (error) {
          console.error("Erro ao descriptografar telefone na listagem:", error);
        }
      }

      return {
        id: user.id,
        anon_name: user.anon_name,
        ...(isOwnerOrAdmin ? { phone_number: decryptedPhone } : {}),
        profile_picture: user.profile_picture,
        created_at: user.created_at,
        is_active: user.is_active,
      };
    });
  }

  async update (
    id: string,
    input: UpdateUserDTO,
    loggedUserId?: string,
    loggedUserRole?: string,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    const isOwner = loggedUserId === user.id;
    const isAdmin = loggedUserRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Não tem permissão para atualizar este utilizador");
    }

    if (input.anon_name !== undefined && input.anon_name !== user.anon_name) {
      const anonName = input.anon_name.trim();

      if (anonName.length < 3 || anonName.length > 30) {
        throw new Error(
          "O nome de utilizador deve ter entre 3 e 30 caracteres",
        );
      }

      const reservedNames = [
        "admin",
        "administrator",
        "support",
        "moderator",
        "root",
        "anonimo",
        "anônimo",
        "staff",
      ];

      if (reservedNames.includes(anonName.toLowerCase())) {
        throw new Error("Este nome de utilizador não está disponível");
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
        throw new Error("Este nome de utilizador já está em uso");
      }

      user.anon_name = anonName;
    }

    if (input.password_hash) {
      if (input.password_hash.length < 8) {
        throw new Error("A palavra-passe deve ter pelo menos 8 caracteres");
      }

      // Quem está a mudar a própria palavra-passe tem de confirmar a actual
      // (um admin a repor a palavra-passe de outra conta não precisa).
      if (isOwner && !isAdmin) {
        if (!input.current_password) {
          throw new Error("Indica a palavra-passe actual para a poderes alterar");
        }
        const currentMatches = await bcrypt.compare(
          input.current_password,
          user.password_hash,
        );
        if (!currentMatches) {
          throw new Error("A palavra-passe actual está incorrecta");
        }
      }

      const isSamePassword = await bcrypt.compare(
        input.password_hash,
        user.password_hash,
      );

      if (isSamePassword) {
        throw new Error("A nova palavra-passe deve ser diferente da atual");
      }

      user.password_hash = await bcrypt.hash(input.password_hash, 10);
    }

    if (input.phone_number) {
      const phone = input.phone_number.replace(/\s/g, "");

      const phoneRegex = /^(\+244)?9\d{8}$/;

      if (!phoneRegex.test(phone)) {
        throw new Error("Número de telefone inválido");
      }

      const encryptedPhone = encrypt(phone);

      const existingPhone =
        await this.userRepository.findByPhoneNumber(encryptedPhone);

      if (existingPhone && existingPhone.id !== user.id) {
        throw new Error("Este número já está associado a outra conta");
      }

      user.phone_number = encryptedPhone;
    }

    if (isAdmin && input.is_active !== undefined) {
      user.is_active = input.is_active;
    }

    if (isOwner) {
      if (input.notify_likes !== undefined) user.notify_likes = input.notify_likes;
      if (input.notify_comments !== undefined) user.notify_comments = input.notify_comments;
      if (input.notify_follows !== undefined) user.notify_follows = input.notify_follows;
      if (input.notify_messages !== undefined) user.notify_messages = input.notify_messages;
      if (input.anonymous_mode !== undefined) user.anonymous_mode = input.anonymous_mode;
      if (input.comment_permission !== undefined) user.comment_permission = input.comment_permission;
      if (input.dm_permission !== undefined) user.dm_permission = input.dm_permission;
    }

    const updatedUser = await this.userRepository.update(user);

    const responseUser: Partial<User> = {
      ...updatedUser,
    };

    delete responseUser.password_hash;
    delete responseUser.google_id_hash;

    if (isOwner || isAdmin) {
      if (responseUser.phone_number) {
        try {
          responseUser.phone_number = decrypt(responseUser.phone_number);
        } catch (error) {
          console.error("Erro ao descriptografar telefone:", error);

          throw new Error("Não foi possível processar o telefone");
        }
      }

      return responseUser;
    }

    delete responseUser.phone_number;

    return responseUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    await this.userRepository.delete(id);
  }
}
