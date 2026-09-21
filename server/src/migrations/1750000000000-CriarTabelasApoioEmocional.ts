import { MigrationInterface, QueryRunner } from "typeorm"

export class CriarTabelasApoioEmocional1750000000000 implements MigrationInterface {
	name = "CriarTabelasApoioEmocional1750000000000"

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Enums
		await queryRunner.query(`
			CREATE TYPE "public"."support_conversations_status_enum"
			AS ENUM('active', 'closed')
		`)

		await queryRunner.query(`
			CREATE TYPE "public"."support_messages_role_enum"
			AS ENUM('user', 'assistant')
		`)

		// Tabela de conversas
		await queryRunner.query(`
			CREATE TABLE "support_conversations" (
				"id"         uuid        NOT NULL DEFAULT uuid_generate_v4(),
				"user_id"    uuid        NOT NULL,
				"status"     "public"."support_conversations_status_enum"
				             NOT NULL DEFAULT 'active',
				"created_at" TIMESTAMP   NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
				CONSTRAINT "PK_support_conversations" PRIMARY KEY ("id")
			)
		`)

		// Tabela de mensagens
		await queryRunner.query(`
			CREATE TABLE "support_messages" (
				"id"              uuid        NOT NULL DEFAULT uuid_generate_v4(),
				"conversation_id" uuid        NOT NULL,
				"role"            "public"."support_messages_role_enum" NOT NULL,
				"content"         text        NOT NULL,
				"is_crisis"       boolean     NOT NULL DEFAULT false,
				"created_at"      TIMESTAMP   NOT NULL DEFAULT now(),
				CONSTRAINT "PK_support_messages" PRIMARY KEY ("id")
			)
		`)

		// FK: conversa → utilizador
		await queryRunner.query(`
			ALTER TABLE "support_conversations"
			ADD CONSTRAINT "FK_support_conversations_user"
			FOREIGN KEY ("user_id")
			REFERENCES "user"("id")
			ON DELETE CASCADE ON UPDATE NO ACTION
		`)

		// FK: mensagem → conversa
		await queryRunner.query(`
			ALTER TABLE "support_messages"
			ADD CONSTRAINT "FK_support_messages_conversation"
			FOREIGN KEY ("conversation_id")
			REFERENCES "support_conversations"("id")
			ON DELETE CASCADE ON UPDATE NO ACTION
		`)

		// Índice para acelerar "buscar mensagens de uma conversa"
		await queryRunner.query(`
			CREATE INDEX "IDX_support_messages_conversation_id"
			ON "support_messages" ("conversation_id")
		`)

		// Índice para acelerar "buscar conversas de um utilizador"
		await queryRunner.query(`
			CREATE INDEX "IDX_support_conversations_user_id"
			ON "support_conversations" ("user_id")
		`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_support_conversations_user_id"`)
		await queryRunner.query(`DROP INDEX "IDX_support_messages_conversation_id"`)
		await queryRunner.query(`ALTER TABLE "support_messages" DROP CONSTRAINT "FK_support_messages_conversation"`)
		await queryRunner.query(`ALTER TABLE "support_conversations" DROP CONSTRAINT "FK_support_conversations_user"`)
		await queryRunner.query(`DROP TABLE "support_messages"`)
		await queryRunner.query(`DROP TABLE "support_conversations"`)
		await queryRunner.query(`DROP TYPE "public"."support_messages_role_enum"`)
		await queryRunner.query(`DROP TYPE "public"."support_conversations_status_enum"`)
	}
}
