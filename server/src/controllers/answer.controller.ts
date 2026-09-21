import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { AnswerService } from "../service/answer.service";
import { CreateAnswerDTO } from "../dto/answer.dto";
import { NotificationService } from "../service/notification.service";
import { NotificationType, TargetType } from "../entities/notification.entity";
import { ModerationBlockedError } from "../utils/errors";

export class AnswerController {
  private answerService: AnswerService;
  private notificationService: NotificationService;

  constructor() {
    this.answerService = new AnswerService();
    this.notificationService = new NotificationService();
  }

  private getParamId = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value ?? "";
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const commentId = this.getParamId(req.params.id);

      const dto = plainToInstance(CreateAnswerDTO, req.body);

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

      const answer = await this.answerService.create(commentId, dto, userId);

      return res.status(201).json({
        message: "Resposta criada com sucesso",
        answer: {
          id: answer.id,
          text: answer.text,
          profile_picture: answer.user.profile_picture,
          anon_name: answer.user.anon_name,
          created_at: answer.created_at,
          status: answer.status,
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
      const answerId = this.getParamId(req.params.id);
      const dto = plainToInstance(CreateAnswerDTO, req.body);

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

      const answer = await this.answerService.update(answerId, dto, userId);

      return res.status(200).json({
        message: "Resposta atualizada com sucesso",
        answer: {
          id: answer.id,
          text: answer.text,
          profile_picture: answer.user.profile_picture,
          anon_name: answer.user.anon_name,
          updated_at: answer.updated_at,
          status: answer.status,
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
      const answerId = this.getParamId(req.params.id);
      await this.answerService.delete(answerId, userId);

      return res.status(200).json({ message: "Resposta deletada com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new AnswerController();
