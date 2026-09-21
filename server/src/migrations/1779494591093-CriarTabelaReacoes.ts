import { MigrationInterface, QueryRunner } from "typeorm";

export class CriarTabelaReacoes1779494591093 implements MigrationInterface {
    name = 'CriarTabelaReacoes1779494591093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."answer_reaction_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`CREATE TABLE "answer_reaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."answer_reaction_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "answerId" uuid, CONSTRAINT "UQ_ccb39d02896ae7f9f1079394b80" UNIQUE ("userId", "answerId"), CONSTRAINT "PK_b85794d4a4ac59b5a2d5a4c960a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."comment_reaction_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`CREATE TABLE "comment_reaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."comment_reaction_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "commentId" uuid, CONSTRAINT "UQ_ef2a92012f8f3f973326eeb608d" UNIQUE ("userId", "commentId"), CONSTRAINT "PK_87f27d282c06eb61b1e0cde2d24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."post_reaction_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`CREATE TABLE "post_reaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."post_reaction_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "postId" uuid, CONSTRAINT "UQ_8f0e895fae24ab37d0f5eb53c2f" UNIQUE ("userId", "postId"), CONSTRAINT "PK_72c5fe23f6a0f35b8c2ba78945f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_shares" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, "userId" uuid, "platform" character varying(50) NOT NULL DEFAULT 'link', "shareToken" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8359d735b1536a05a57a2a2d1a7" UNIQUE ("shareToken"), CONSTRAINT "PK_41290cd17ae407e8d73aaa4fa93" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "answer" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."answer_status_enum" RENAME TO "answer_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_status_enum" AS ENUM('active', 'deleted', 'flagged', 'edited')`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" TYPE "public"."answer_status_enum" USING "status"::"text"::"public"."answer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."answer_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."comment_status_enum" RENAME TO "comment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."comment_status_enum" AS ENUM('active', 'deleted', 'flagged', 'edited')`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" TYPE "public"."comment_status_enum" USING "status"::"text"::"public"."comment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."comment_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum" RENAME TO "post_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."post_status_enum" AS ENUM('active', 'deleted', 'flagged', 'edited')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" TYPE "public"."post_status_enum" USING "status"::"text"::"public"."post_status_enum"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."post_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "answer_reaction" ADD CONSTRAINT "FK_72f08ae0df3bb95cffcff362acc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_reaction" ADD CONSTRAINT "FK_dbbb707ec73b6b9a32a6f5ea93f" FOREIGN KEY ("answerId") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_92536a1358ea6b6611812f62f3a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_88bb607240417f03c0592da6824" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_reaction" ADD CONSTRAINT "FK_5019c594c963270ac7a6bfafbec" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_reaction" ADD CONSTRAINT "FK_5e7b98f3cea583c73a0bbbe0de1" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_shares" ADD CONSTRAINT "FK_0cf5df17d5dac2d43ac01817e94" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_shares" ADD CONSTRAINT "FK_0c802b35b3e81c1c9a210b134c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_shares" DROP CONSTRAINT "FK_0c802b35b3e81c1c9a210b134c4"`);
        await queryRunner.query(`ALTER TABLE "post_shares" DROP CONSTRAINT "FK_0cf5df17d5dac2d43ac01817e94"`);
        await queryRunner.query(`ALTER TABLE "post_reaction" DROP CONSTRAINT "FK_5e7b98f3cea583c73a0bbbe0de1"`);
        await queryRunner.query(`ALTER TABLE "post_reaction" DROP CONSTRAINT "FK_5019c594c963270ac7a6bfafbec"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_88bb607240417f03c0592da6824"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_92536a1358ea6b6611812f62f3a"`);
        await queryRunner.query(`ALTER TABLE "answer_reaction" DROP CONSTRAINT "FK_dbbb707ec73b6b9a32a6f5ea93f"`);
        await queryRunner.query(`ALTER TABLE "answer_reaction" DROP CONSTRAINT "FK_72f08ae0df3bb95cffcff362acc"`);
        await queryRunner.query(`CREATE TYPE "public"."post_status_enum_old" AS ENUM('active', 'deleted', 'flagged')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" TYPE "public"."post_status_enum_old" USING "status"::"text"::"public"."post_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."post_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum_old" RENAME TO "post_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."comment_status_enum_old" AS ENUM('active', 'deleted', 'flagged')`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" TYPE "public"."comment_status_enum_old" USING "status"::"text"::"public"."comment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."comment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."comment_status_enum_old" RENAME TO "comment_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."answer_status_enum_old" AS ENUM('active', 'deleted', 'flagged')`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" TYPE "public"."answer_status_enum_old" USING "status"::"text"::"public"."answer_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "answer" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."answer_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."answer_status_enum_old" RENAME TO "answer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "dislikes_count"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "dislikes_count"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "dislikes_count"`);
        await queryRunner.query(`ALTER TABLE "answer" DROP COLUMN "likes_count"`);
        await queryRunner.query(`DROP TABLE "post_shares"`);
        await queryRunner.query(`DROP TABLE "post_reaction"`);
        await queryRunner.query(`DROP TYPE "public"."post_reaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "comment_reaction"`);
        await queryRunner.query(`DROP TYPE "public"."comment_reaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "answer_reaction"`);
        await queryRunner.query(`DROP TYPE "public"."answer_reaction_type_enum"`);
    }

}
