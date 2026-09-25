import AppDataSource from "../database/connection";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { UserRepository } from "../repositories/user.repository";
import aiService from "./ai.service";
import moderationService from "./moderation.service";
import { ModerationBlockedError } from "../utils/errors";
import { getIO } from "../socket";
import badWordsFilter from "../utils/bad-words-filter";
import leoProfanity from "leo-profanity";
import blockService from "./block.service";

export class MessageService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
  }

  private orderPair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  /**
   * Só é permitido conversar com alguém com quem já houve alguma interação
   * pública: seguir/ser seguido, comentar o post um do outro, ou responder
   * a um comentário um do outro. Evita contacto não solicitado de
   * desconhecidos.
   */
  async hasInteracted(userIdA: string, userIdB: string): Promise<boolean> {
    const result = await AppDataSource.query(
      `
      SELECT EXISTS (
        SELECT 1 FROM follow
          WHERE ("followerId" = $1 AND "followingId" = $2)
             OR ("followerId" = $2 AND "followingId" = $1)
        UNION
        SELECT 1 FROM comment c JOIN post p ON c."postId" = p.id
          WHERE (c."userId" = $1 AND p."userId" = $2)
             OR (c."userId" = $2 AND p."userId" = $1)
        UNION
        SELECT 1 FROM answer a JOIN comment c ON a."commentId" = c.id
          WHERE (a."userId" = $1 AND c."userId" = $2)
             OR (a."userId" = $2 AND c."userId" = $1)
      ) AS "exists"
      `,
      [userIdA, userIdB],
    );
    return !!result?.[0]?.exists;
  }

  private async getOrCreateConversation(
    userAId: string,
    userBId: string,
  ): Promise<Conversation> {
    const [first, second] = this.orderPair(userAId, userBId);

    const existing = await this.conversationRepository.findBetween(
      first,
      second,
    );
    if (existing) return existing;

    if (await blockService.isBlockedEitherWay(userAId, userBId)) {
      throw new Error("Não podes conversar com este utilizador.");
    }

    const recipient = await this.userRepository.findById(userBId);
    const dmPermission = recipient?.dm_permission ?? "connections";

    if (dmPermission === "nobody") {
      throw new Error(
        "Esta pessoa desactivou novos pedidos de conversa privada.",
      );
    }

    if (dmPermission === "connections") {
      const canTalk = await this.hasInteracted(userAId, userBId);
      if (!canTalk) {
        throw new Error(
          "Só podes iniciar conversa com alguém com quem já tenhas interagido (seguir, comentar ou responder).",
        );
      }
    }

    const conversation = new Conversation();
    conversation.userAId = first;
    conversation.userBId = second;
    return this.conversationRepository.create(conversation);
  }

  async sendMessage(
    senderId: string,
    recipientId: string,
    text: string,
  ): Promise<Message> {
    if (senderId === recipientId) {
      throw new Error("Não podes enviar uma mensagem a ti mesmo");
    }
    if (!text || !text.trim()) {
      throw new Error("A mensagem não pode estar vazia");
    }

    const recipient = await this.userRepository.findById(recipientId);
    if (!recipient) {
      throw new Error("Utilizador não encontrado");
    }

    const cleanedText = badWordsFilter(leoProfanity.clean(text));

    const analysis = await aiService.moderateContent(cleanedText);
    if (analysis.blocked) {
      await moderationService.recordViolationAndMaybeBan(
        senderId,
        "message",
        analysis.category,
        analysis.reason,
      );
      throw new ModerationBlockedError(
        analysis.reason ||
          "Esta mensagem não pode ser enviada por violar as regras de segurança da comunidade.",
        analysis.category,
      );
    }

    const conversation = await this.getOrCreateConversation(
      senderId,
      recipientId,
    );

    const message = new Message();
    message.conversationId = conversation.id;
    message.senderId = senderId;
    message.text = cleanedText;
    const saved = await this.messageRepository.save(message);
    await this.conversationRepository.touch(conversation.id);

    const sender = await this.userRepository.findById(senderId);

    const payload = {
      id: saved.id,
      conversationId: conversation.id,
      senderId,
      text: saved.text,
      created_at: saved.created_at,
      sender: sender
        ? { anon_name: sender.anon_name, profile_picture: sender.profile_picture }
        : null,
    };

    getIO()?.to(recipientId).emit("message", payload);

    return saved;
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationRepository.findAllForUser(
      userId,
    );

    const items = await Promise.all(
      conversations.map(async (conversation) => {
        const other =
          conversation.userAId === userId
            ? conversation.userB
            : conversation.userA;

        const [lastMessage, unreadCount] = await Promise.all([
          this.messageRepository.findLastForConversation(conversation.id),
          this.messageRepository.countUnread(conversation.id, userId),
        ]);

        return {
          id: conversation.id,
          user: {
            id: other.id,
            anon_name: other.anon_name,
            profile_picture: other.profile_picture,
          },
          lastMessage: lastMessage
            ? { text: lastMessage.text, created_at: lastMessage.created_at, senderId: lastMessage.senderId }
            : null,
          unreadCount,
        };
      }),
    );

    return items;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number,
    pageSize: number,
  ) {
    const conversation = await this.conversationRepository.findById(
      conversationId,
    );
    if (!conversation) {
      throw new Error("Conversa não encontrada");
    }
    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new Error("Não tem permissão para aceder a esta conversa");
    }

    const { items, total } = await this.messageRepository.findByConversation(
      conversationId,
      pageSize,
      (page - 1) * pageSize,
    );

    return {
      total,
      page,
      pageSize,
      items: items
        .map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.text,
          created_at: m.created_at,
          isRead: m.isRead,
          sender: { anon_name: m.sender.anon_name, profile_picture: m.sender.profile_picture },
        }))
        .reverse(),
    };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
    );
    if (!conversation) {
      throw new Error("Conversa não encontrada");
    }
    if (conversation.userAId !== userId && conversation.userBId !== userId) {
      throw new Error("Não tem permissão para aceder a esta conversa");
    }

    await this.messageRepository.markConversationAsRead(conversationId, userId);
  }
}
