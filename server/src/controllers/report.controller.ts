import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { CreateReportDto } from "../dto/report.dto";
import { ReportService } from "../service/report.service";

class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.anon_name?.id;
      if (!userId) {
        return res.status(401).json({ error: "Token inválido ou não fornecido" });
      }

      const dto = plainToInstance(CreateReportDto, req.body);
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

      const { targetType, targetId } = req.params as {
        targetType: string;
        targetId: string;
      };

      const report = await this.reportService.create(
        targetType,
        targetId,
        userId,
        dto.reason,
        dto.details,
      );

      return res.status(201).json({
        message: "Denúncia registada com sucesso. Obrigado por ajudar a manter a comunidade segura.",
        report: {
          id: report.id,
          target_type: report.target_type,
          target_id: report.target_id,
          reason: report.reason,
          created_at: report.created_at,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Erro ao registar denúncia",
      });
    }
  };
}

export default new ReportController();
