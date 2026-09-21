import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarSuportePreferenciasEDenunciaMensagens1789960069435 implements MigrationInterface {
    name = 'AdicionarSuportePreferenciasEDenunciaMensagens1789960069435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_likes" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_comments" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_follows" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "notify_messages" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."report_target_type_enum" RENAME TO "report_target_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."report_target_type_enum" AS ENUM('post', 'comment', 'answer', 'message')`);
        await queryRunner.query(`ALTER TABLE "report" ALTER COLUMN "target_type" TYPE "public"."report_target_type_enum" USING "target_type"::"text"::"public"."report_target_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."report_target_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('LIKE', 'COMMENT', 'ANSWER', 'MENTION', 'FOLLOW', 'ADMIN_REPORT', 'ADMIN_BAN', 'ADMIN_CRISIS')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_target_type_enum" RENAME TO "notifications_target_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_target_type_enum" AS ENUM('POST', 'COMMENT', 'ANSWER', 'USER', 'REPORT', 'SUPPORT_CONVERSATION')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "target_type" TYPE "public"."notifications_target_type_enum" USING "target_type"::"text"::"public"."notifications_target_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_target_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_target_type_enum_old" AS ENUM('POST', 'COMMENT', 'ANSWER', 'USER')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "target_type" TYPE "public"."notifications_target_type_enum_old" USING "target_type"::"text"::"public"."notifications_target_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_target_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_target_type_enum_old" RENAME TO "notifications_target_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('LIKE', 'COMMENT', 'ANSWER', 'MENTION', 'FOLLOW')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."report_target_type_enum_old" AS ENUM('post', 'comment', 'answer')`);
        await queryRunner.query(`ALTER TABLE "report" ALTER COLUMN "target_type" TYPE "public"."report_target_type_enum_old" USING "target_type"::"text"::"public"."report_target_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."report_target_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."report_target_type_enum_old" RENAME TO "report_target_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_messages"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_follows"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_comments"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notify_likes"`);
    }

}
