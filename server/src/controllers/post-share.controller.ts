import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreatePostShareDto } from "../dto/post-share.dto";
import { PostShareService } from "../service/post-share.service";

class PostShareController {
  private postShareService: PostShareService;

  constructor() {
    this.postShareService = new PostShareService();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name ? req.anon_name.id : null;

      const dto = plainToInstance(CreatePostShareDto, req.body);

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

      const result = await this.postShareService.generateShare(
        dto.postId,
        dto.platform,
        userId,
      );

      return res.status(201).json({
        message: "Link de partilha gerado com sucesso",
        share: {
          id: result.share.id,
          postId: result.share.postId,
          platform: result.share.platform,
          shareToken: result.share.shareToken,
          userId: result.share.userId, // Ficará gravado como null na base de dados
          created_at: result.share.created_at,
        },
        shareLinks: result.shareLinks,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Erro interno do servidor ao gerar partilha",
        message: error.message,
      });
    }
  };
}

export default new PostShareController();
