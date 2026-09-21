import { Report, ReportTargetType } from "../entities/report.entity";
import { ReportRepository } from "../repositories/report.repository";
import { PostRepository } from "../repositories/post.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { AnswerRepository } from "../repositories/answer.repository";

export class ReportService {
  private reportRepository: ReportRepository;
  private postRepository: PostRepository;
  private commentRepository: CommentRepository;
  private answerRepository: AnswerRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
    this.answerRepository = new AnswerRepository();
  }

  async create(
    targetType: string,
    targetId: string,
    userId: string,
    reason: string,
    details: string | undefined,
  ): Promise<Report> {
    if (
      !Object.values(ReportTargetType).includes(targetType as ReportTargetType)
    ) {
      throw new Error("Tipo de conteúdo denunciado inválido.");
    }

    const targetExists = await this.targetExists(
      targetType as ReportTargetType,
      targetId,
    );
    if (!targetExists) {
      throw new Error("O conteúdo que estás a tentar denunciar não existe.");
    }

    const report = new Report();
    report.target_type = targetType as ReportTargetType;
    report.target_id = targetId;
    report.reason = reason;
    report.details = details || null;
    report.user = { id: userId } as any;

    return this.reportRepository.save(report);
  }

  private async targetExists(
    targetType: ReportTargetType,
    targetId: string,
  ): Promise<boolean> {
    switch (targetType) {
      case ReportTargetType.POST:
        return !!(await this.postRepository.findByPostId(targetId));
      case ReportTargetType.COMMENT:
        return !!(await this.commentRepository.findById(targetId));
      case ReportTargetType.ANSWER:
        return !!(await this.answerRepository.findById(targetId));
      default:
        return false;
    }
  }
}
