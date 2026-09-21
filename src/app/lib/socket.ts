import { io, Socket } from "socket.io-client";
import Cookies from "universal-cookie";

let socket: Socket | null = null;

/**
 * Liga directamente ao servidor da API (não passa pelo proxy do Next.js —
 * WebSockets precisam de uma ligação directa). Reaproveita o mesmo domínio
 * já usado para os media assets. Devolve null em ambientes onde a API não
 * tenha um servidor HTTP persistente (ex.: handler serverless da Vercel),
 * caso em que o socket simplesmente nunca liga.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_MEDIA_URL;
  if (!baseUrl) return null;

  const cookies = new Cookies();
  const token = cookies.get("aa_token");
  if (!token) return null;

  if (!socket) {
    socket = io(baseUrl, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
