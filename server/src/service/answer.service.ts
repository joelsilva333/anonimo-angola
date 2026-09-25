import { NotificationType, TargetType } from "../entities/notification.entity";
import { CreateAnswerDTO } from "../dto/answer.dto";
import { Answer } from "../entities/answer.entity";
import { AnswerRepository } from "../repositories/answer.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { UserRepository } from "../repositories/user.repository";
import badWordsFilter from "../utils/bad-words-filter";
import { NotificationService } from "./notification.service";
import aiService from "./ai.service";
import moderationService from "./moderation.service";
import { ModerationBlockedError } from "../utils/errors";
import { getIO } from "../socket";
import { displayIdentity } from "../utils/anonymize";

export class AnswerService {
  private answerRepository: AnswerRepository;
  private commentRepository: CommentRepository;
  private userRepository: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.userRepository = new UserRepository();
    this.commentRepository = new CommentRepository();
    this.answerRepository = new AnswerRepository();
    this.notificationService = new NotificationService();
  }

  async create(
    commentId: string,
    input: CreateAnswerDTO,
    userId: string,
  ): Promise<Answer> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.id !== userId) {
      throw new Error("Não tem permisão para responder");
    }

    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new Error("Comentário não encontrado");
    }

    const cleanedText = badWordsFilter(input.text);

    const analysis = await aiService.moderateContent(cleanedText);
    if (analysis.blocked) {
      await moderationService.recordViolationAndMaybeBan(
        userId,
        "answer",
        analysis.category,
        analysis.reason,
      );
      throw new ModerationBlockedError(
        analysis.reason ||
          "Esta resposta não pode ser publicada por violar as regras de segurança da comunidade.",
        analysis.category,
      );
    }

    const answer = new Answer();

    if (comment.id === commentId) {
      answer.user = user;
      answer.comment = comment;
      answer.created_at = new Date();
      answer.text = cleanedText;
      answer.status = "active";
    }

    if (comment.user.id !== user.id) {
      await this.notificationService.sendNotification({
        recipientId: comment.user.id,
        targetId: comment.id,
        targetType: TargetType.COMMENT,
        type: NotificationType.ANSWER,
        senderId: user.id,
      });
    }

    const savedAnswer = await this.answerRepository.create(answer);

    getIO()?.emit("feed:new-answer", {
      postId: comment.post.id,
      commentId: comment.id,
      answer: {
        id: savedAnswer.id,
        text: savedAnswer.text,
        created_at: savedAnswer.created_at,
        status: savedAnswer.status,
        like: 0,
        dislike: 0,
        ...displayIdentity(user),
      },
    });

    return savedAnswer;
  }

  async update(
    answerId: string,
    input: CreateAnswerDTO,
    userId: string,
  ): Promise<Answer> {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer) {
      throw new Error("Resposta não encontrada");
    }

    if (answer.user.id !== userId) {
      throw new Error("Não tem permissão para atualizar esta resposta");
    }

    const cleanedText = badWordsFilter(input.text);

    const analysis = await aiService.moderateContent(cleanedText);
    if (analysis.blocked) {
      await moderationService.recordViolationAndMaybeBan(
        userId,
        "answer",
        analysis.category,
        analysis.reason,
      );
      throw new ModerationBlockedError(
        analysis.reason ||
          "Esta resposta não pode ser publicada por violar as regras de segurança da comunidade.",
        analysis.category,
      );
    }

    answer.text = cleanedText;
    answer.updated_at = new Date();
    answer.status = "edited";

    return await this.answerRepository.update(answer);
  }

  async delete(answerId: string, userId: string): Promise<void> {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer) {
      throw new Error("Resposta não encontrada");
    }

    if (answer.user.id !== userId) {
      throw new Error("Não tem permissão para deletar esta resposta");
    }

    await this.answerRepository.delete(answerId);
  }
}
