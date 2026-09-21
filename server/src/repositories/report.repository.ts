import { Repository } from "typeorm";
import { Report, ReportStatus } from "../entities/report.entity";
import AppDataSource from "../database/connection";

export class ReportRepository {
  private reportRepository: Repository<Report>;

  constructor() {
    this.reportRepository = AppDataSource.getRepository(Report);
  }

  async save(report: Report): Promise<Report> {
    return this.reportRepository.save(report);
  }

  async findById(id: string): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async findAllPaginated(
    status: ReportStatus | undefined,
    page: number,
    pageSize: number,
  ): Promise<{ items: Report[]; total: number }> {
    const [items, total] = await this.reportRepository.findAndCount({
      where: status ? { status } : {},
      relations: ["user"],
      order: { created_at: "DESC" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items, total };
  }

  async countByStatus(status: ReportStatus): Promise<number> {
    return this.reportRepository.count({ where: { status } });
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    resolvedBy: string,
  ): Promise<Report> {
    await this.reportRepository.update(id, {
      status,
      resolved_at: new Date(),
      resolved_by: resolvedBy,
    });
    const report = await this.findById(id);
    if (!report) throw new Error("Denúncia não encontrada");
    return report;
  }
}
