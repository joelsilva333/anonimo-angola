import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarSeguirChatAlgoritmoBanimento1789955519625 implements MigrationInterface {
    name = 'AdicionarSeguirChatAlgoritmoBanimento1789955519625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support_conversations" DROP CONSTRAINT "FK_support_conversations_user"`);
        await queryRunner.query(`ALTER TABLE "support_messages" DROP CONSTRAINT "FK_support_messages_conversation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_support_conversations_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_support_messages_conversation_id"`);
        await queryRunner.query(`CREATE TABLE "post_impression" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "postId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b529987a3058d9b3f705542a26c" UNIQUE ("userId", "postId"), CONSTRAINT "PK_90b3185047281c9ce1e21cdf44e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36f3458260ddd0cde9d8fc20f1" ON "post_impression" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5700549fa33ed93e019a85532" ON "post_impression" ("postId") `);
        await queryRunner.query(`CREATE TABLE "moderation_violation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "contentType" character varying NOT NULL, "category" character varying NOT NULL, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_789135c8e39f3f406dd64e48c2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8beb70071b336be0d2af199eee" ON "moderation_violation" ("userId") `);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userAId" uuid NOT NULL, "userBId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "lastMessageAt" TIMESTAMP, CONSTRAINT "UQ_b667cf315d00e9b3b5fc46ba4e8" UNIQUE ("userAId", "userBId"), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5659bced9f3c9f8f47827c087b" ON "conversation" ("userAId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f8b3f1bf18a110123ba1a0d0e" ON "conversation" ("userBId") `);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversationId" uuid NOT NULL, "senderId" uuid NOT NULL, "text" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7cf4a4df1f2627f72bf6231635" ON "message" ("conversationId") `);
        await queryRunner.query(`CREATE TABLE "follow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId"), CONSTRAINT "PK_fda88bc28a84d2d6d06e19df6e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_550dce89df9570f251b6af2665" ON "follow" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9f68503556c5d72a161ce3851" ON "follow" ("followingId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "google_id_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_9d11e721ef9786796a7530b5753" UNIQUE ("google_id_hash")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "onboarding_completed" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "banned_reason" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "banned_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "report" ADD "details" text`);
        await queryRunner.query(`CREATE TYPE "public"."report_status_enum" AS ENUM('pending', 'resolved', 'dismissed')`);
        await queryRunner.query(`ALTER TABLE "report" ADD "status" "public"."report_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "report" ADD "resolved_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "report" ADD "resolved_by" uuid`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "target_id"`);
        await queryRunner.query(`ALTER TABLE "report" ADD "target_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('LIKE', 'COMMENT', 'ANSWER', 'MENTION', 'FOLLOW')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_target_type_enum" RENAME TO "notifications_target_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_target_type_enum" AS ENUM('POST', 'COMMENT', 'ANSWER', 'USER')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "target_type" TYPE "public"."notifications_target_type_enum" USING "target_type"::"text"::"public"."notifications_target_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_target_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "support_conversations" ADD CONSTRAINT "FK_f57072dec76d252f87cbda85e53" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "support_messages" ADD CONSTRAINT "FK_45bd9fd9a360d139543049b71de" FOREIGN KEY ("conversation_id") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_5659bced9f3c9f8f47827c087b0" FOREIGN KEY ("userAId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_7f8b3f1bf18a110123ba1a0d0ef" FOREIGN KEY ("userBId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_550dce89df9570f251b6af2665a" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_e9f68503556c5d72a161ce38513" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_e9f68503556c5d72a161ce38513"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_550dce89df9570f251b6af2665a"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_7f8b3f1bf18a110123ba1a0d0ef"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_5659bced9f3c9f8f47827c087b0"`);
        await queryRunner.query(`ALTER TABLE "support_messages" DROP CONSTRAINT "FK_45bd9fd9a360d139543049b71de"`);
        await queryRunner.query(`ALTER TABLE "support_conversations" DROP CONSTRAINT "FK_f57072dec76d252f87cbda85e53"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_target_type_enum_old" AS ENUM('POST', 'COMMENT', 'ANSWER')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "target_type" TYPE "public"."notifications_target_type_enum_old" USING "target_type"::"text"::"public"."notifications_target_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_target_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_target_type_enum_old" RENAME TO "notifications_target_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('LIKE', 'COMMENT', 'ANSWER', 'MENTION')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "target_id"`);
        await queryRunner.query(`ALTER TABLE "report" ADD "target_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "resolved_by"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "resolved_at"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "details"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "banned_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "banned_reason"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "onboarding_completed"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_9d11e721ef9786796a7530b5753"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "google_id_hash"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9f68503556c5d72a161ce3851"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_550dce89df9570f251b6af2665"`);
        await queryRunner.query(`DROP TABLE "follow"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7cf4a4df1f2627f72bf6231635"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f8b3f1bf18a110123ba1a0d0e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5659bced9f3c9f8f47827c087b"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8beb70071b336be0d2af199eee"`);
        await queryRunner.query(`DROP TABLE "moderation_violation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5700549fa33ed93e019a85532"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36f3458260ddd0cde9d8fc20f1"`);
        await queryRunner.query(`DROP TABLE "post_impression"`);
        await queryRunner.query(`CREATE INDEX "IDX_support_messages_conversation_id" ON "support_messages" ("conversation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_support_conversations_user_id" ON "support_conversations" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "support_messages" ADD CONSTRAINT "FK_support_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "support_conversations" ADD CONSTRAINT "FK_support_conversations_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
