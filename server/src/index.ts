import type { Request, Response } from "express";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import AppDataSource from "./database/connection";
import routes from "./routes";
import { setupSwagger } from "./swagger";
import { initSocket } from "./socket";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://anonimo-angola.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "../public")));

setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use(routes);

async function garantirConexaoBancoDeDados() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida.");
  }
}

/**
 * Serverless handler para Vercel
 */
export default async function handler(req: Request, res: Response) {
  try {
    await garantirConexaoBancoDeDados();
    app(req, res);
  } catch (erro) {
    console.error("Erro ao inicializar a conexão com o banco de dados:", erro);
    res.status(500).json({ erro: "Falha ao conectar ao banco de dados." });
  }
}

/**
 * Executar servidor em ambientes tradicionais (Render ou Local/Desenvolvimento)
 */
const deveRodarServidorLocal =
  process.env.RENDER === "true" || !process.env.VERCEL;

if (deveRodarServidorLocal) {
  const PORT = process.env.PORT || 8080;

  garantirConexaoBancoDeDados()
    .then(() => {
      const httpServer = app.listen(PORT, () => {
        console.log(`Servidor ativo com sucesso!`);
        console.log(`Local: http://localhost:${PORT}`);
        console.log(
          `📄 Documentação Swagger: http://localhost:${PORT}/api-docs`,
        );
      });
      initSocket(httpServer);
    })
    .catch((erro) => {
      console.error("Erro crítico ao iniciar o servidor local:", erro);
    });
}
