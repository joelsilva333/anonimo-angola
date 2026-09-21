import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { SendMessageDTO } from "../dto/message.dto";
import { MessageService } from "../service/message.service";
import { ModerationBlockedError } from "../utils/errors";

class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  private getParamId(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  send = async (req: Request, res: Response): Promise<Response> => {
    try {
      const senderId = req.anon_name?.id;
      if (!senderId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const recipientId = this.getParamId(req.params.userId);

      const dto = plainToInstance(SendMessageDTO, req.body);
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

      const message = await this.messageService.sendMessage(
        senderId,
        recipientId,
        dto.text,
      );

      return res.status(201).json({
        message: "Mensagem enviada com sucesso",
        data: message,
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

      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getConversations = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const conversations = await this.messageService.getConversations(userId);
      return res.status(200).json(conversations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getMessages = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const conversationId = this.getParamId(req.params.id);
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.pageSize ?? "30"), 10) || 30),
      );

      const result = await this.messageService.getMessages(
        conversationId,
        userId,
        page,
        pageSize,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const conversationId = this.getParamId(req.params.id);
      await this.messageService.markAsRead(conversationId, userId);

      return res.status(200).json({ message: "Conversa marcada como lida" });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new MessageController();
