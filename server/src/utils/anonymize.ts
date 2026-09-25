import { User } from "../entities/user.entity";

/**
 * Quando o autor tem o "Modo Anônimo Permanente" activo, a autoria do
 * conteúdo aparece como "Anônimo" e sem link de perfil (userId null),
 * impedindo que várias publicações sejam associadas à mesma identidade só
 * de olhar para o feed.
 */
export function displayIdentity(user: Pick<User, "id" | "anon_name" | "profile_picture" | "anonymous_mode">): {
  userId: string | null;
  anon_name: string;
  profile_picture: string;
} {
  if (user.anonymous_mode) {
    return { userId: null, anon_name: "Anônimo", profile_picture: "" };
  }
  return {
    userId: user.id,
    anon_name: user.anon_name,
    profile_picture: user.profile_picture,
  };
}
