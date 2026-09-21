import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreateReactionDto } from "../dto/reaction.dto";
import { ReactionService } from "../service/reaction.service";

interface AuthenticatedRequest extends Request {
  anon_name?: {
    id: string;
  };
}

export class ReactionController {
  private reactionService: ReactionService;

  constructor() {
    this.reactionService = new ReactionService();
  }

  private async validateDto(
    body: any,
  ): Promise<{ errors?: any; dto?: CreateReactionDto }> {
    const dto = plainToInstance(CreateReactionDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return {
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      };
    }
    return { dto };
  }

  reactToPost = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      const postId = typeof req.params.id === "string" ? req.params.id : undefined;
      if (!userId) {
        return res.status(401).json({ error: "Utilizador não identificado." });
      }
      if (!postId) {
        return res.status(400).json({ error: "ID da postagem não fornecido." });
      }

      const { errors, dto } = await this.validateDto(req.body);
      if (errors)
        return res
          .status(400)
          .json({ error: "Erro de validação", details: errors });

      const result = await this.reactionService.reactToPost(postId, userId, dto!.type);

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Erro em reactToPost:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  reactToComment = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      const commentId = typeof req.params.id === "string" ? req.params.id : undefined;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não identificado." });
      }
      if (!commentId) {
        return res
          .status(400)
          .json({ error: "ID do comentário não fornecido." });
      }

      const { errors, dto } = await this.validateDto(req.body);
      if (errors)
        return res
          .status(400)
          .json({ error: "Erro de validação", details: errors });

      const result = await this.reactionService.reactToComment(
        commentId,
        userId,
        dto!.type,
      );

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Erro em reactToComment:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  reactToAnswer = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const userId = req.anon_name?.id; 
      const answerId = typeof req.params.id === "string" ? req.params.id : undefined;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não identificado." });
      }
      if (!answerId) {
        return res.status(400).json({ error: "ID da resposta não fornecido." });
      }

      const { errors, dto } = await this.validateDto(req.body);
      if (errors)
        return res
          .status(400)
          .json({ error: "Erro de validação", details: errors });

      const result = await this.reactionService.reactToAnswer(answerId, userId, dto!.type);

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error("Erro em reactToAnswer:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}
