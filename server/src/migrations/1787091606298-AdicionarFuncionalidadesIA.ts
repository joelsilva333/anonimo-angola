import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adiciona as colunas necessárias às funcionalidades de IA (Gemini):
 *  - post.mood_label / post.ai_crisis_detected / post.theme_tags / post.embedding
 *  - comment.is_ai_welcome
 * E cria o utilizador de sistema "Anônimo Angola IA", usado para publicar as
 * mensagens de "Acolhimento Automático IA".
 */
export class AdicionarFuncionalidadesIA1787091606298 implements MigrationInterface {
  name = "AdicionarFuncionalidadesIA1787091606298";

  /** ID fixo do utilizador de sistema da IA (usado apenas para o comentário de acolhimento). */
  public static readonly AI_SYSTEM_USER_ID = "00000000-0000-4000-8000-000000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" ADD "mood_label" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD "ai_crisis_detected" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "post" ADD "theme_tags" text`);
    await queryRunner.query(`ALTER TABLE "post" ADD "embedding" jsonb`);

    await queryRunner.query(
      `ALTER TABLE "comment" ADD "is_ai_welcome" boolean NOT NULL DEFAULT false`,
    );

    // Cria o "utilizador" de sistema que assina os comentários de acolhimento automático da IA.
    // password_hash/phone_number recebem valores neutros: esta conta nunca faz login.
    await queryRunner.query(
      `INSERT INTO "user" ("id", "anon_name", "profile_picture", "password_hash", "phone_number", "role", "is_active")
       VALUES ('${AdicionarFuncionalidadesIA1787091606298.AI_SYSTEM_USER_ID}', 'Anônimo Angola IA', 'avatar1.png', 'ia-sistema-sem-login', 'ia-sistema', 'user', true)
       ON CONFLICT ("id") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE "id" = '${AdicionarFuncionalidadesIA1787091606298.AI_SYSTEM_USER_ID}'`,
    );
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "is_ai_welcome"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "embedding"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "theme_tags"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "ai_crisis_detected"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "mood_label"`);
  }
}
