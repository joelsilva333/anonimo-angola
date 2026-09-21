import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

let io: Server | null = null;

interface JwtPayload {
  id: string;
  anon_name: string;
}

/**
 * Liga o Socket.io ao servidor HTTP já existente. Cada socket autentica-se
 * com o mesmo JWT usado nas rotas REST (enviado em `socket.handshake.auth.token`)
 * e entra automaticamente numa "room" com o seu próprio userId — assim,
 * emitir para `io.to(userId)` chega só a esse utilizador, em todos os
 * separadores/dispositivos onde tenha sessão aberta.
 *
 * Só é chamado no arranque "tradicional" (local/Render) — no handler
 * serverless da Vercel não há servidor HTTP persistente para ligar
 * WebSockets, por isso `getIO()` pode devolver null nesse ambiente.
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "https://anonimo-angola.vercel.app"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new Error("Token não fornecido"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(userId);

    socket.on("disconnect", () => {
      socket.leave(userId);
    });
  });

  console.log("🔌 Socket.io ligado ao servidor HTTP.");
  return io;
}

/** Devolve a instância activa, ou null se ainda não tiver sido inicializada (ex.: em ambiente serverless). */
export function getIO(): Server | null {
  return io;
}
