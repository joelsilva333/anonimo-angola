export const getProfilePictureUrl = (src: string | undefined) => {
  if (!src) return "/avatar1.png"; // Um avatar padrão caso não exista foto
  
  // Se a string já for uma URL completa (ex: começa com http), retorna ela mesma
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  
  // Se for um caminho relativo (ex: /profile_picture/...), concatena com o domínio de mídias da API
  const baseUrl = process.env.NEXT_PUBLIC_API_MEDIA_URL || "";
  
  // Remove barras duplas acidentais na junção
  return `${baseUrl.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
};