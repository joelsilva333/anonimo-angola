import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { Block } from "../entities/block.entity";

export class BlockRepository {
  private repository: Repository<Block>;

  constructor() {
    this.repository = AppDataSource.getRepository(Block);
  }

  async findByBlockerAndBlocked(
    blockerId: string,
    blockedId: string,
  ): Promise<Block | null> {
    return this.repository.findOne({ where: { blockerId, blockedId } });
  }

  async save(block: Block): Promise<Block> {
    return this.repository.save(block);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByBlockerAndBlocked(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    await this.repository.delete({ blockerId, blockedId });
  }

  /** true se QUALQUER um dos dois tiver bloqueado o outro. */
  async isBlockedEitherWay(userIdA: string, userIdB: string): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder("block")
      .where(
        "(block.blockerId = :a AND block.blockedId = :b) OR (block.blockerId = :b AND block.blockedId = :a)",
        { a: userIdA, b: userIdB },
      )
      .getCount();
    return count > 0;
  }

  /** ids de todos os utilizadores envolvidos num bloqueio com `userId` (nas duas direcções). */
  async findRelatedBlockedIds(userId: string): Promise<Set<string>> {
    const rows = await this.repository
      .createQueryBuilder("block")
      .select("block.blockerId", "blockerId")
      .addSelect("block.blockedId", "blockedId")
      .where("block.blockerId = :userId OR block.blockedId = :userId", { userId })
      .getRawMany();

    const ids = new Set<string>();
    for (const row of rows) {
      if (row.blockerId !== userId) ids.add(row.blockerId);
      if (row.blockedId !== userId) ids.add(row.blockedId);
    }
    return ids;
  }

  async findBlockedByUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: Block[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { blockerId: userId },
      relations: ["blocked"],
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }
}
