import { Request, Response } from "express";
import { AdminService } from "../service/admin.service";
import { ReportStatus } from "../entities/report.entity";

class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getStats = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const stats = await this.adminService.getStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  listUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const status =
        req.query.status === "active" || req.query.status === "suspended"
          ? req.query.status
          : undefined;

      const result = await this.adminService.listUsers({ search, status, page, pageSize });
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getUserViolations = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const violations = await this.adminService.getUserViolations(id);
      return res.status(200).json(violations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  banUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body;
      const result = await this.adminService.banUser(id, reason);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  unbanUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminService.unbanUser(id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  listViolations = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );
      const result = await this.adminService.listViolations(page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  listReports = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );
      const status = Object.values(ReportStatus).includes(req.query.status as ReportStatus)
        ? (req.query.status as ReportStatus)
        : undefined;

      const result = await this.adminService.listReports(status, page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  resolveReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { action, deleteContent } = req.body;
      const adminId = req.anon_name?.id;

      if (action !== "resolved" && action !== "dismissed") {
        return res.status(400).json({ error: "Acção inválida." });
      }

      const result = await this.adminService.resolveReport(
        id,
        adminId,
        action,
        !!deleteContent,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  listSupportConversations = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );
      const result = await this.adminService.listSupportConversations(page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };

  getSupportConversation = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminService.getSupportConversation(id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(404).json({
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  };
}

export default new AdminController();
