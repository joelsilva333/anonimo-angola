import { CreateCommentDTO, UpdateCommentDTO } from "../dto/comment.dto";
import { Comment } from "../entities/comment.entity";
import { CommentRepository } from "../repositories/comment.repository";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import badWordsFilter from "../utils/bad-words-filter";
import leoProfanity from "leo-profanity";
import { NotificationService } from "./notification.service";
import { NotificationType, TargetType } from "../entities/notification.entity";
import aiService from "./ai.service";
import moderationService from "./moderation.service";
import { ModerationBlockedError } from "../utils/errors";
import { getIO } from "../socket";
import { displayIdentity } from "../utils/anonymize";
import blockService from "./block.service";

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;
  private userRepository: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
  }

  async create(
    postId: string,
    input: CreateCommentDTO,
    userId: string,
  ): Promise<Comment> {
    const post = await this.postRepository.findByPostId(postId);

    if (!post) {
      throw new Error("Post não encontrado");
    }

    if (!input.text) {
      throw new Error("O comentário não pode estar vazio");
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (post.user.id !== userId) {
      if (await blockService.isBlockedEitherWay(userId, post.user.id)) {
        throw new Error("Não podes comentar neste desabafo.");
      }

      if (
        post.user.comment_permission === "nobody" ||
        (post.user.comment_permission === "authenticated" && user.role === "anonymous")
      ) {
        throw new Error(
          "O autor deste desabafo restringiu quem pode comentar.",
        );
      }
    }

    const cleanedText = badWordsFilter(leoProfanity.clean(input.text));

    const analysis = await aiService.moderateContent(cleanedText);
    if (analysis.blocked) {
      await moderationService.recordViolationAndMaybeBan(
        userId,
        "comment",
        analysis.category,
        analysis.reason,
      );
      throw new ModerationBlockedError(
        analysis.reason ||
          "Este comentário não pode ser publicado por violar as regras de segurança da comunidade.",
        analysis.category,
      );
    }

    const comment = new Comment();
    comment.post = post;
    comment.user = user;
    comment.text = cleanedText;
    comment.created_at = new Date();
    comment.status = "active";

    const savedComment = await this.commentRepository.create(comment);

    getIO()?.emit("feed:new-comment", {
      postId: post.id,
      comment: {
        id: savedComment.id,
        text: savedComment.text,
        created_at: savedComment.created_at,
        status: savedComment.status,
        is_ai_welcome: false,
        like: 0,
        dislike: 0,
        ...displayIdentity(user),
        answers: [],
      },
    });

    if (post.user.id !== user.id) {
      await this.notificationService.sendNotification({
        senderId: user.id,
        recipientId: post.user.id,
        type: NotificationType.COMMENT,
        targetId: post.id,
        targetType: TargetType.POST,
      });
    }

    return savedComment;
  }

  async update(
    commentId: string,
    input: UpdateCommentDTO,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new Error("Comentário não encontrado");
    }

    if (userId !== comment.user.id) {
      throw new Error("Não tem autorização para editar o comentário");
    }

    if (input.text) {
      const cleanedText = badWordsFilter(leoProfanity.clean(input.text));

      const analysis = await aiService.moderateContent(cleanedText);
      if (analysis.blocked) {
        await moderationService.recordViolationAndMaybeBan(
          userId,
          "comment",
          analysis.category,
          analysis.reason,
        );
        throw new ModerationBlockedError(
          analysis.reason ||
            "Este comentário não pode ser publicado por violar as regras de segurança da comunidade.",
          analysis.category,
        );
      }

      comment.text = cleanedText;
    }

    if (input.status) {
      comment.status = input.status;
    }

    comment.status = input.status;

    return this.commentRepository.update(comment);
  }

  async getById(id: string): Promise<Comment | null> {
    if (!id) {
      throw new Error("Comentário não encontrado");
    }

    return this.commentRepository.findById(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new Error("Comentário não encontrado");
    }

    if (userId !== comment.post.user.id && userId !== comment.user.id) {
      throw new Error("Não tem permissão para apagar o comentário");
    }

    await this.commentRepository.delete(id);
  }
}
