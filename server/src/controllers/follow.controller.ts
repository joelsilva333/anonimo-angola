import { Request, Response } from "express";
import { FollowService } from "../service/follow.service";

class FollowController {
  private followService: FollowService;

  constructor() {
    this.followService = new FollowService();
  }

  private getParamId(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  toggleFollow = async (req: Request, res: Response): Promise<Response> => {
    try {
      const followerId = req.anon_name?.id;
      if (!followerId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const followingId = this.getParamId(req.params.id);
      const result = await this.followService.toggleFollow(
        followerId,
        followingId,
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

  getFollowers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getParamId(req.params.id);
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );

      const result = await this.followService.getFollowers(
        userId,
        page,
        pageSize,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getFollowing = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = this.getParamId(req.params.id);
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );

      const result = await this.followService.getFollowing(
        userId,
        page,
        pageSize,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new FollowController();
