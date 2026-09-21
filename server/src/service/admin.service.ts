import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { ReportRepository } from "../repositories/report.repository";
import { ModerationViolationRepository } from "../repositories/moderation-violation.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import { ReportStatus, ReportTargetType } from "../entities/report.entity";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class AdminService {
  private userRepository: UserRepository;
  private postRepository: PostRepository;
  private reportRepository: ReportRepository;
  private violationRepository: ModerationViolationRepository;
  private commentRepository: CommentRepository;
  private answerRepository: AnswerRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.postRepository = new PostRepository();
    this.reportRepository = new ReportRepository();
    this.violationRepository = new ModerationViolationRepository();
    this.commentRepository = new CommentRepository();
    this.answerRepository = new AnswerRepository();
  }

  async getStats() {
    const since7d = new Date(Date.now() - SEVEN_DAYS_MS);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsers7d,
      totalPosts,
      flaggedPosts,
      crisisPosts,
      newPosts7d,
      pendingReports,
      resolvedReports,
      dismissedReports,
      totalViolations,
    ] = await Promise.all([
      this.userRepository.countTotal(),
      this.userRepository.countActive(),
      this.userRepository.countSuspended(),
      this.userRepository.countCreatedSince(since7d),
      this.postRepository.countTotal(),
      this.postRepository.countByStatus("flagged"),
      this.postRepository.countCrisisDetected(),
      this.postRepository.countCreatedSince(since7d),
      this.reportRepository.countByStatus(ReportStatus.PENDING),
      this.reportRepository.countByStatus(ReportStatus.RESOLVED),
      this.reportRepository.countByStatus(ReportStatus.DISMISSED),
      this.violationRepository.countTotal(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        newLast7Days: newUsers7d,
      },
      posts: {
        total: totalPosts,
        flagged: flaggedPosts,
        crisisDetected: crisisPosts,
        newLast7Days: newPosts7d,
      },
      reports: {
        pending: pendingReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
      },
      violations: {
        total: totalViolations,
      },
    };
  }

  async listUsers(filters: {
    search?: string;
    status?: "active" | "suspended";
    page: number;
    pageSize: number;
  }) {
    const { items, total } = await this.userRepository.findPaginated(filters);
    return {
      items: items.map((u) => ({
        id: u.id,
        anon_name: u.anon_name,
        profile_picture: u.profile_picture,
        role: u.role,
        is_active: u.is_active,
        banned_reason: u.banned_reason,
        banned_at: u.banned_at,
        created_at: u.created_at,
        last_login_at: u.last_login_at,
      })),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async getUserViolations(userId: string) {
    return this.violationRepository.findByUser(userId);
  }

  async banUser(userId: string, reason: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Utilizador não encontrado");
    if (user.role === "admin") {
      throw new Error("Não é possível suspender outro administrador.");
    }

    user.is_active = false;
    user.banned_reason = reason || `Suspensão manual por um administrador.`;
    user.banned_at = new Date();
    await this.userRepository.update(user);

    return { id: user.id, is_active: user.is_active, banned_reason: user.banned_reason };
  }

  async unbanUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Utilizador não encontrado");

    user.is_active = true;
    user.banned_reason = null;
    user.banned_at = null;
    await this.userRepository.update(user);

    return { id: user.id, is_active: user.is_active };
  }

  async listViolations(page: number, pageSize: number) {
    const { items, total } = await this.violationRepository.findAllPaginated(
      page,
      pageSize,
    );
    const userIds = [...new Set(items.map((v) => v.userId))];
    const users = await this.userRepository.findByIds(userIds);
    const usersById = new Map(users.map((u) => [u.id, u]));

    return {
      items: items.map((v) => ({
        id: v.id,
        userId: v.userId,
        anon_name: usersById.get(v.userId)?.anon_name || "Desconhecido",
        contentType: v.contentType,
        category: v.category,
        reason: v.reason,
        created_at: v.created_at,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async getReportTargetPreview(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<{ text: string; authorAnonName: string | null } | null> {
    try {
      if (targetType === ReportTargetType.POST) {
        const post = await this.postRepository.findByPostId(targetId);
        if (!post) return null;
        return { text: post.text, authorAnonName: post.user?.anon_name || null };
      }
      if (targetType === ReportTargetType.COMMENT) {
        const comment = await this.commentRepository.findById(targetId);
        if (!comment) return null;
        return {
          text: comment.text,
          authorAnonName: comment.user?.anon_name || null,
        };
      }
      if (targetType === ReportTargetType.ANSWER) {
        const answer = await this.answerRepository.findById(targetId);
        if (!answer) return null;
        return {
          text: answer.text,
          authorAnonName: answer.user?.anon_name || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  async listReports(status: ReportStatus | undefined, page: number, pageSize: number) {
    const { items, total } = await this.reportRepository.findAllPaginated(
      status,
      page,
      pageSize,
    );

    const withPreview = await Promise.all(
      items.map(async (report) => ({
        id: report.id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        target_type: report.target_type,
        target_id: report.target_id,
        created_at: report.created_at,
        resolved_at: report.resolved_at,
        reporter: {
          id: report.user?.id,
          anon_name: report.user?.anon_name,
        },
        target: await this.getReportTargetPreview(
          report.target_type,
          report.target_id,
        ),
      })),
    );

    return { items: withPreview, total, page, pageSize };
  }

  async resolveReport(
    reportId: string,
    adminId: string,
    action: "resolved" | "dismissed",
    deleteContent: boolean,
  ) {
    const report = await this.reportRepository.findById(reportId);
    if (!report) throw new Error("Denúncia não encontrada");

    if (deleteContent && action === "resolved") {
      await this.deleteReportedContent(report.target_type, report.target_id);
    }

    const status =
      action === "resolved" ? ReportStatus.RESOLVED : ReportStatus.DISMISSED;

    const updated = await this.reportRepository.updateStatus(
      reportId,
      status,
      adminId,
    );

    return {
      id: updated.id,
      status: updated.status,
      resolved_at: updated.resolved_at,
      target_type: updated.target_type,
      target_id: updated.target_id,
    };
  }

  private async deleteReportedContent(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<void> {
    if (targetType === ReportTargetType.POST) {
      await this.postRepository.delete(targetId);
    } else if (targetType === ReportTargetType.COMMENT) {
      await this.commentRepository.delete(targetId);
    } else if (targetType === ReportTargetType.ANSWER) {
      await this.answerRepository.delete(targetId);
    }
  }
}
