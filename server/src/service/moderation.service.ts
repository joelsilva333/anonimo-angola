import { ModerationViolationRepository } from "../repositories/moderation-violation.repository";
import { UserRepository } from "../repositories/user.repository";
import { ViolationContentType } from "../entities/moderation-violation.entity";
import { ModerationCategory } from "./ai.service";
import { NotificationService } from "./notification.service";
import { NotificationType, TargetType } from "../entities/notification.entity";

/** Limiar de violações antes de suspender a conta automaticamente. */
const VIOLATION_THRESHOLD = 3;
/** Janela deslizante em que as violações contam para o limiar. */
const VIOLATION_WINDOW_DAYS = 7;

export class ModerationService {
  private violationRepository: ModerationViolationRepository;
  private userRepository: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.violationRepository = new ModerationViolationRepository();
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Chamado sempre que a IA bloqueia uma publicação (post, comentário,
   * resposta ou mensagem). Regista a violação e, se o utilizador acumular
   * `VIOLATION_THRESHOLD` ou mais nos últimos `VIOLATION_WINDOW_DAYS` dias,
   * suspende a conta automaticamente (`is_active = false`).
   *
   * Nunca lança erro — uma falha aqui não deve impedir a resposta de
   * bloqueio original de chegar ao utilizador.
   */
  async recordViolationAndMaybeBan(
    userId: string,
    contentType: ViolationContentType,
    category: ModerationCategory,
    reason: string | null,
  ): Promise<void> {
    try {
      await this.violationRepository.create(userId, contentType, category, reason);

      const since = new Date();
      since.setDate(since.getDate() - VIOLATION_WINDOW_DAYS);
      const count = await this.violationRepository.countSince(userId, since);

      if (count >= VIOLATION_THRESHOLD) {
        const user = await this.userRepository.findById(userId);
        if (user && user.is_active) {
          user.is_active = false;
          user.banned_reason = `Suspensão automática: ${count} conteúdos bloqueados pela IA (moderação de segurança) em ${VIOLATION_WINDOW_DAYS} dias.`;
          user.banned_at = new Date();
          await this.userRepository.update(user);

          await this.notificationService.notifyAdmins(
            NotificationType.ADMIN_BAN,
            TargetType.USER,
            userId,
          );
        }
      }
    } catch (err) {
      console.error(
        "[ModerationService] Falha ao registar violação/avaliar suspensão:",
        err,
      );
    }
  }
}

export default new ModerationService();
