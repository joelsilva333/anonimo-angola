import { Block } from "../entities/block.entity";
import { BlockRepository } from "../repositories/block.repository";
import { FollowRepository } from "../repositories/follow.repository";
import { UserRepository } from "../repositories/user.repository";

export class BlockService {
  private blockRepository: BlockRepository;
  private followRepository: FollowRepository;
  private userRepository: UserRepository;

  constructor() {
    this.blockRepository = new BlockRepository();
    this.followRepository = new FollowRepository();
    this.userRepository = new UserRepository();
  }

  /** Alterna bloquear/desbloquear. Ao bloquear, remove qualquer "seguir" nas duas direcções. */
  async toggleBlock(
    blockerId: string,
    blockedId: string,
  ): Promise<{ blocked: boolean }> {
    if (blockerId === blockedId) {
      throw new Error("Não podes bloquear-te a ti mesmo");
    }

    const target = await this.userRepository.findById(blockedId);
    if (!target) {
      throw new Error("Utilizador não encontrado");
    }

    const existing = await this.blockRepository.findByBlockerAndBlocked(
      blockerId,
      blockedId,
    );

    if (existing) {
      await this.blockRepository.delete(existing.id);
      return { blocked: false };
    }

    const block = new Block();
    block.blockerId = blockerId;
    block.blockedId = blockedId;
    await this.blockRepository.save(block);

    const [followingThem, followedByThem] = await Promise.all([
      this.followRepository.findByFollowerAndFollowing(blockerId, blockedId),
      this.followRepository.findByFollowerAndFollowing(blockedId, blockerId),
    ]);
    if (followingThem) await this.followRepository.delete(followingThem.id);
    if (followedByThem) await this.followRepository.delete(followedByThem.id);

    return { blocked: true };
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const existing = await this.blockRepository.findByBlockerAndBlocked(
      blockerId,
      blockedId,
    );
    return !!existing;
  }

  async isBlockedEitherWay(userIdA: string, userIdB: string): Promise<boolean> {
    return this.blockRepository.isBlockedEitherWay(userIdA, userIdB);
  }

  /** ids de utilizadores a esconder do feed de `userId` (bloqueou ou foi bloqueado). */
  async getHiddenUserIds(userId: string): Promise<Set<string>> {
    return this.blockRepository.findRelatedBlockedIds(userId);
  }

  async getBlockedList(userId: string, page: number, pageSize: number) {
    const { items, total } = await this.blockRepository.findBlockedByUser(
      userId,
      pageSize,
      (page - 1) * pageSize,
    );
    return {
      total,
      page,
      pageSize,
      items: items.map((b) => ({
        id: b.blocked.id,
        anon_name: b.blocked.anon_name,
        profile_picture: b.blocked.profile_picture,
        blockedAt: b.created_at,
      })),
    };
  }
}

export default new BlockService();
