import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarRemocaoAdminComentario1790358253748 implements MigrationInterface {
    name = 'AdicionarRemocaoAdminComentario1790358253748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."comment_status_enum" RENAME TO "comment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."comment_status_enum" AS ENUM('active', 'deleted', 'flagged', 'edited', 'removed_by_admin')`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" TYPE "public"."comment_status_enum" USING "status"::"text"::"public"."comment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."comment_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comment_status_enum_old" AS ENUM('active', 'deleted', 'flagged', 'edited')`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" TYPE "public"."comment_status_enum_old" USING "status"::"text"::"public"."comment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."comment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."comment_status_enum_old" RENAME TO "comment_status_enum"`);
    }

}
