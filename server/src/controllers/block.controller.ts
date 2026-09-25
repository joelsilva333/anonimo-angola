import { Request, Response } from "express";
import blockService from "../service/block.service";

class BlockController {
  private getParamId(value: string | string[] | undefined): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  }

  toggleBlock = async (req: Request, res: Response): Promise<Response> => {
    try {
      const blockerId = req.anon_name?.id;
      if (!blockerId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const blockedId = this.getParamId(req.params.id);
      const result = await blockService.toggleBlock(blockerId, blockedId);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getBlockedList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );

      const result = await blockService.getBlockedList(userId, page, pageSize);
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

export default new BlockController();
