import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import {
  ModerationViolation,
  ViolationContentType,
} from "../entities/moderation-violation.entity";
import { ModerationCategory } from "../service/ai.service";

export class ModerationViolationRepository {
  private repository: Repository<ModerationViolation>;

  constructor() {
    this.repository = AppDataSource.getRepository(ModerationViolation);
  }

  async create(
    userId: string,
    contentType: ViolationContentType,
    category: ModerationCategory,
    reason: string | null,
  ): Promise<ModerationViolation> {
    const violation = this.repository.create({
      userId,
      contentType,
      category,
      reason,
    });
    return this.repository.save(violation);
  }

  async countSince(userId: string, since: Date): Promise<number> {
    return this.repository
      .createQueryBuilder("violation")
      .where("violation.userId = :userId", { userId })
      .andWhere("violation.created_at >= :since", { since })
      .getCount();
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
  ): Promise<{ items: ModerationViolation[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      order: { created_at: "DESC" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items, total };
  }

  async findByUser(userId: string): Promise<ModerationViolation[]> {
    return this.repository.find({
      where: { userId },
      order: { created_at: "DESC" },
    });
  }

  async countTotal(): Promise<number> {
    return this.repository.count();
  }
}
