import { Repository } from "typeorm";
import { PostShare } from "../entities/post-share.entity";
import AppDataSource from "../database/connection";

export class PostShareRepository {
  private postShareRepository: Repository<PostShare>;

  constructor() {
    this.postShareRepository = AppDataSource.getRepository(PostShare);
  }

  async save(postShare: PostShare): Promise<PostShare> {
  return this.postShareRepository.save(postShare);
}

  async findByToken(shareToken: string): Promise<PostShare | null> {
    return this.postShareRepository.findOne({
      where: { shareToken },
      relations: ["post"],
    });
  }

  async countByPostId(postId: string): Promise<number> {
    return this.postShareRepository.count({ where: { postId } });
  }
}
