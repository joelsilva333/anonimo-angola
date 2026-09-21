import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreatePostDTO, UpdatePostDTO } from "../dto/post.dto";
import { ModerationBlockedError, PostService } from "../service/post.service";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  private getRouteParamId(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return value ?? "";
  }

  private formatPostResponse(post: any) {
    return {
      id: post.id,
      userId: post.user.id,
      anon_name: post.user.anon_name,
      profile_picture: post.user.profile_picture,
      text: post.text,
      like: post.likes_count || post.like || 0,
      dislike: post.dislikes_count || post.dislike || 0,
      created_at: post.created_at,
      status: post.status,
      has_reacted: post.has_reacted,
      reaction_type: post.reaction_type,
      mood_label: post.mood_label ?? null,
      ai_crisis_detected: !!post.ai_crisis_detected,
      theme_tags: post.theme_tags || [],
      comments: (post.comments || []).map((comment: any) => ({
        id: comment.id,
        userId: comment.user.id,
        anon_name: comment.user.anon_name,
        profile_picture: comment.user.profile_picture,
        text: comment.text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        status: comment.status,
        like: comment.likes_count || comment.like || 0,
        dislike: comment.dislikes_count || comment.dislike || 0,
        has_reacted: comment.has_reacted,
        reaction_type: comment.reaction_type,
        is_ai_welcome: !!comment.is_ai_welcome,
        answers: (comment.answers || []).map((answer: any) => ({
          id: answer.id,
          userId: answer.user.id,
          anon_name: answer.user.anon_name,
          profile_picture: answer.user.profile_picture,
          text: answer.text,
          created_at: answer.created_at,
          updated_at: answer.updated_at,
          status: answer.status,
          like: answer.likes_count || answer.like || 0,
          dislike: answer.dislikes_count || answer.dislike || 0,
          has_reacted: answer.has_reacted,
          reaction_type: answer.reaction_type,
        })),
      })),
    };
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const dto = plainToInstance(CreatePostDTO, req.body);

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

      const post = await this.postService.create(dto, userId);

      // Reaproveita o formatador principal para já incluir o comentário de
      // "Acolhimento Automático IA" (se tiver sido criado) na resposta,
      // garantindo que a pessoa vê logo que a sua voz foi ouvida.
      return res.status(201).json(this.formatPostResponse(post));
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
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  /**
   * GET /posts/:id/similar
   * "Relatos semelhantes que podes querer ler" — matching inteligente por
   * afinidade, com base em embeddings gerados pelo Gemini.
   */
  getSimilar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = this.getRouteParamId(req.params.id);
      const similar = await this.postService.findSimilar(id, 3);
      return res.status(200).json(similar);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const id = this.getRouteParamId(req.params.id);
      const dto = plainToInstance(UpdatePostDTO, req.body);

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

      const post = await this.postService.update(userId, id, dto);

      return res.status(200).json({
        id: post.id,
        userId: post.user.id,
        anon_name: post.user.anon_name,
        profile_picture: post.user.profile_picture,
        text: post.text,
        created_at: post.created_at,
        status: post.status,
      });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id: userId } = req.anon_name;
      const id = this.getRouteParamId(req.params.id);

      await this.postService.delete(id, userId);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const currentUserId = req.anon_name?.id;
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "15"), 10) || 15),
      );

      const posts = await this.postService.findAll(currentUserId, page, pageSize);

      // Agora usa a mesma formatação estruturada de árvore
      return res
        .status(200)
        .json(posts.map((post) => this.formatPostResponse(post)));
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = this.getRouteParamId(req.params.id);
      const currentUserId = req.anon_name?.id;

      const post = await this.postService.findById(id, currentUserId);

      return res.status(200).json(this.formatPostResponse(post));
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };

  getAllByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getRouteParamId(req.params.userId);
      const posts = await this.postService.findAllByUserId(userId);

      return res
        .status(200)
        .json(posts.map((post) => this.formatPostResponse(post)));
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}

export default new PostController();
