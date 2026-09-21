import { PostReaction } from "../entities/post-reaction.entity";
import { CommentReaction } from "../entities/comment-reaction.entity";
import { AnswerReaction } from "../entities/answer-reaction.entity";
import { PostReactionRepository } from "../repositories/post-reaction.repository";
import { CommentReactionRepository } from "../repositories/comment-reaction.repository";
import { AnswerReactionRepository } from "../repositories/answer-reaction.repository";
import { NotificationService } from "./notification.service";
import { NotificationType, TargetType } from "../entities/notification.entity";
import { PostRepository } from "../repositories/post.repository";
import { CommentRepository } from "../repositories/comment.repository";
import { AnswerRepository } from "../repositories/answer.repository";
import { ReactionType } from "src/entities/reaction.enum";
import { getIO } from "../socket";

export class ReactionService {
  private postReactionRepository: PostReactionRepository;
  private commentReactionRepository: CommentReactionRepository;
  private answerReactionRepository: AnswerReactionRepository;
  private notificationService: NotificationService;
  private postRepository: PostRepository;
  private commentRepository: CommentRepository;
  private answerRepository: AnswerRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
    this.answerRepository = new AnswerRepository();
    this.postReactionRepository = new PostReactionRepository();
    this.commentReactionRepository = new CommentReactionRepository();
    this.answerReactionRepository = new AnswerReactionRepository();
    this.notificationService = new NotificationService();
  }

  async reactToPost(postId: string, userId: string, type: ReactionType) {
    const post = await this.postRepository.findByPostId(postId);

    if (!post) {
      throw new Error("Post não encontrado.");
    }

    const existingReaction =
      await this.postReactionRepository.findByUserAndPost(userId, postId);

    if (userId === post.user.id) {
      
    }

    if (existingReaction) {
      await this.postReactionRepository.delete(existingReaction.id);
      await this.postRepository.decrementLikes(postId);
      const likesCount = await this.postRepository.getLikesCount(postId);

      getIO()?.emit("feed:post-reaction", {
        postId,
        likesCount,
        actorUserId: userId,
        reacted: false,
      });

      return { reacted: false, message: "Reação removida do post.", likesCount };
    }

    const newReaction = new PostReaction();
    newReaction.user = { id: userId } as any;
    newReaction.post = { id: postId } as any;
    newReaction.type = type;

    await this.postReactionRepository.save(newReaction);
    await this.postRepository.incrementLikes(postId);
    const likesCount = await this.postRepository.getLikesCount(postId);

    getIO()?.emit("feed:post-reaction", {
      postId,
      likesCount,
      actorUserId: userId,
      reacted: true,
    });

    this.notificationService
      .sendNotification({
        type: NotificationType.LIKE,
        targetType: TargetType.POST,
        targetId: postId,
        senderId: userId,
        recipientId: post.user.id,
      })
      .catch((err) =>
        console.error("Falha ao gerar notificação do post:", err),
      );

    return { reacted: true, message: "Post reagido com sucesso.", likesCount };
  }

  async reactToComment(commentId: string, userId: string, type: ReactionType) {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new Error("Comentário não encontrado.");
    }

    const existingReaction =
      await this.commentReactionRepository.findByUserAndComment(
        userId,
        commentId,
      );

    if (existingReaction) {
      await this.commentReactionRepository.delete(existingReaction.id);
      await this.commentRepository.decrementLikes(commentId);
      const likesCount = await this.commentRepository.getLikesCount(commentId);

      getIO()?.emit("feed:comment-reaction", {
        postId: comment.post.id,
        commentId,
        likesCount,
        actorUserId: userId,
        reacted: false,
      });

      return { reacted: false, message: "Reação removida do comentário.", likesCount };
    }

    const newReaction = new CommentReaction();
    newReaction.user = { id: userId } as any;
    newReaction.comment = { id: commentId } as any;
    newReaction.type = type;

    await this.commentReactionRepository.save(newReaction);
    await this.commentRepository.incrementLikes(commentId);
    const likesCount = await this.commentRepository.getLikesCount(commentId);

    getIO()?.emit("feed:comment-reaction", {
      postId: comment.post.id,
      commentId,
      likesCount,
      actorUserId: userId,
      reacted: true,
    });

    this.notificationService
      .sendNotification({
        type: NotificationType.LIKE,
        targetType: TargetType.COMMENT,
        targetId: commentId,
        senderId: userId,
        recipientId: comment.user.id,
      })
      .catch((err) =>
        console.error("Falha ao gerar notificação do comentário:", err),
      );

    return { reacted: true, message: "Comentário reagido com sucesso.", likesCount };
  }

  async reactToAnswer(answerId: string, userId: string, type: ReactionType) {
    const answer = await this.answerRepository.findById(answerId);

    if (!answer) {
      throw new Error("Resposta não encontrada.");
    }

    const existingReaction =
      await this.answerReactionRepository.findByUserAndAnswer(userId, answerId);

    if (existingReaction) {
      await this.answerReactionRepository.delete(existingReaction.id);
      await this.answerRepository.decrementLikes(answerId);
      const likesCount = await this.answerRepository.getLikesCount(answerId);

      getIO()?.emit("feed:answer-reaction", {
        postId: answer.comment.post.id,
        commentId: answer.comment.id,
        answerId,
        likesCount,
        actorUserId: userId,
        reacted: false,
      });

      return { reacted: false, message: "Reação removida da resposta.", likesCount };
    }

    const newReaction = new AnswerReaction();
    newReaction.user = { id: userId } as any;
    newReaction.answer = { id: answerId } as any;
    newReaction.type = type;

    await this.answerReactionRepository.save(newReaction);
    await this.answerRepository.incrementLikes(answerId);
    const likesCount = await this.answerRepository.getLikesCount(answerId);

    getIO()?.emit("feed:answer-reaction", {
      postId: answer.comment.post.id,
      commentId: answer.comment.id,
      answerId,
      likesCount,
      actorUserId: userId,
      reacted: true,
    });

    this.notificationService
      .sendNotification({
        type: NotificationType.LIKE,
        targetType: TargetType.ANSWER,
        targetId: answerId,
        senderId: userId,
        recipientId: answer.user.id,
      })
      .catch((err) =>
        console.error("Falha ao gerar notificação da resposta:", err),
      );

    return { reacted: true, message: "Resposta reagida com sucesso.", likesCount };
  }
}
