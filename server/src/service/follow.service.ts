import { Follow } from "../entities/follow.entity";
import { FollowRepository } from "../repositories/follow.repository";
import { UserRepository } from "../repositories/user.repository";
import { NotificationService } from "./notification.service";
import { NotificationType, TargetType } from "../entities/notification.entity";

export class FollowService {
  private followRepository: FollowRepository;
  private userRepository: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.followRepository = new FollowRepository();
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
  }

  /** Alterna seguir/deixar de seguir. Devolve o novo estado. */
  async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new Error("Não podes seguir-te a ti mesmo");
    }

    const target = await this.userRepository.findById(followingId);
    if (!target) {
      throw new Error("Utilizador não encontrado");
    }

    const existing = await this.followRepository.findByFollowerAndFollowing(
      followerId,
      followingId,
    );

    if (existing) {
      await this.followRepository.delete(existing.id);
      return { following: false };
    }

    const follow = new Follow();
    follow.followerId = followerId;
    follow.followingId = followingId;
    await this.followRepository.save(follow);

    this.notificationService
      .sendNotification({
        senderId: followerId,
        recipientId: followingId,
        type: NotificationType.FOLLOW,
        targetType: TargetType.USER,
        targetId: followerId,
      })
      .catch((err) => console.error("Falha ao gerar notificação de seguir:", err));

    return { following: true };
  }

  async getFollowCounts(
    userId: string,
  ): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      this.followRepository.countFollowers(userId),
      this.followRepository.countFollowing(userId),
    ]);
    return { followers, following };
  }

  async isFollowing(
    followerId: string | undefined,
    followingId: string,
  ): Promise<boolean> {
    if (!followerId) return false;
    const existing = await this.followRepository.findByFollowerAndFollowing(
      followerId,
      followingId,
    );
    return !!existing;
  }

  async getFollowers(userId: string, page: number, pageSize: number) {
    const { items, total } = await this.followRepository.findFollowers(
      userId,
      pageSize,
      (page - 1) * pageSize,
    );
    return {
      total,
      page,
      pageSize,
      items: items.map((f) => ({
        id: f.follower.id,
        anon_name: f.follower.anon_name,
        profile_picture: f.follower.profile_picture,
        followedAt: f.created_at,
      })),
    };
  }

  async getFollowing(userId: string, page: number, pageSize: number) {
    const { items, total } = await this.followRepository.findFollowing(
      userId,
      pageSize,
      (page - 1) * pageSize,
    );
    return {
      total,
      page,
      pageSize,
      items: items.map((f) => ({
        id: f.following.id,
        anon_name: f.following.anon_name,
        profile_picture: f.following.profile_picture,
        followedAt: f.created_at,
      })),
    };
  }
}
