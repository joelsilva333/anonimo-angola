import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreateCommentDTO, UpdateCommentDTO } from "../dto/comment.dto";
import { CommentService } from "../service/comment.service";
import { ModerationBlockedError } from "../utils/errors";

class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: postId } = req.params;

      if (typeof postId !== "string") {
        return res.status(400).json({ error: "ID do post não fornecido." });
      }

      const { text } = req.body;

      if (!text) {
        return res
          .status(400)
          .json({ error: "Texto do comentário não fornecido." });
      }

      const dto = plainToInstance(CreateCommentDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: "Erro de validação",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const comment = await this.commentService.create(postId, dto, userId);

      return res.status(201).json({
        message: "Comentário criado com sucesso",
        comment: {
          id: comment.id,
          postId: comment.post.id,
          postUserId: comment.post.user.id,
          userId: comment.user.id,
          anon_name: comment.user.anon_name,
          profile_picture: comment.user.profile_picture,
          text: comment.text,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
        },
      });
    } catch (error) {
      console.error(error);

      if (error instanceof ModerationBlockedError) {
        return res.status(422).json({
          error: error.message,
          code: "MODERATION_BLOCKED",
          category: error.category,
        });
      }

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const { commentId, text } = req.body;
      const dto = plainToInstance(UpdateCommentDTO, req.body);

      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: "Erro de validação",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const comment = await this.commentService.update(commentId, dto, userId);

      return res.status(200).json({
        message: "Comentário editado com sucesso",
        comment: {
          id: comment.id,
          postId: comment.post.id,
          postUserId: comment.post.user.id,
          userId: comment.user.id,
          anon_name: comment.user.anon_name,
          profile_picture: comment.user.profile_picture,
          text: comment.text,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
        },
      });
    } catch (error) {
      console.error(error);

      if (error instanceof ModerationBlockedError) {
        return res.status(422).json({
          error: error.message,
          code: "MODERATION_BLOCKED",
          category: error.category,
        });
      }

      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({ error: "ID do comentário inválido" });
      }

      await this.commentService.delete(id, userId);

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({ error: "ID do comentário inválido" });
      }

      const comment = await this.commentService.getById(id);

      if (!comment) {
        return res.status(404).json({ error: "Comentário não encontrado" });
      }

      return res.status(200).json({
        id: comment.id,
        text: comment.text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        userId: comment.user.id,
        anon_name: comment.user.anon_name,
        profile_picture: comment.user.profile_picture,
        answer: comment.answers.map((answer) => ({
          id: answer.id,
          text: answer.text,
          created_at: answer.created_at,
          userId: answer.user.id,
          anon_name: answer.user.anon_name,
          profile_picture: answer.user.profile_picture,
          status: answer.status,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new CommentController();
