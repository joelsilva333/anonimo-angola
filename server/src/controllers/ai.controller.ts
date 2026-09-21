import { Request, Response } from "express";
import { PostService } from "../service/post.service";

class AiController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  /**
   * GET /api/ai/mood-tracker
   * Diário Emocional / Mood Tracker privado: devolve a evolução recente do
   * humor do utilizador autenticado (baseada nos rótulos gerados na
   * criação de cada desabafo) e sugestões leves de autocuidado geradas
   * pela IA. Nenhum texto de desabafo é exposto nesta rota.
   */
  moodTracker = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const data = await this.postService.getMoodTracker(userId);
      return res.status(200).json(data);
    } catch (error) {
      console.error("[AiController] Erro no mood tracker:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new AiController();
