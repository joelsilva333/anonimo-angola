import { Repository } from "typeorm";
import AppDataSource from "../database/connection";
import { Follow } from "../entities/follow.entity";

export class FollowRepository {
  private repository: Repository<Follow>;

  constructor() {
    this.repository = AppDataSource.getRepository(Follow);
  }

  async findByFollowerAndFollowing(
    followerId: string,
    followingId: string,
  ): Promise<Follow | null> {
    return this.repository.findOne({ where: { followerId, followingId } });
  }

  async save(follow: Follow): Promise<Follow> {
    return this.repository.save(follow);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async countFollowers(userId: string): Promise<number> {
    return this.repository.count({ where: { followingId: userId } });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.repository.count({ where: { followerId: userId } });
  }

  async findFollowers(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: Follow[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { followingId: userId },
      relations: ["follower"],
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  async findFollowing(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: Follow[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { followerId: userId },
      relations: ["following"],
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }
}
