/** Lançado quando a IA de moderação bloqueia a publicação de um conteúdo. */
export class ModerationBlockedError extends Error {
  public readonly category: string;
  constructor(message: string, category: string) {
    super(message);
    this.name = "ModerationBlockedError";
    this.category = category;
  }
}

/** Lançado ao tentar autenticar uma conta suspensa (banida automaticamente ou manualmente). */
export class AccountSuspendedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountSuspendedError";
  }
}
