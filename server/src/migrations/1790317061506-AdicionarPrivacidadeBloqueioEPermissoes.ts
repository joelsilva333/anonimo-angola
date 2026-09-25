import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarPrivacidadeBloqueioEPermissoes1790317061506 implements MigrationInterface {
    name = 'AdicionarPrivacidadeBloqueioEPermissoes1790317061506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockerId" uuid NOT NULL, "blockedId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f147961a77e760d035e5cb1f33a" UNIQUE ("blockerId", "blockedId"), CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9ebc8defd368bfbada61840691" ON "block" ("blockerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d5c13d1ced558f476dd2268c4e" ON "block" ("blockedId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "anonymous_mode" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "comment_permission" character varying NOT NULL DEFAULT 'everyone'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "dm_permission" character varying NOT NULL DEFAULT 'connections'`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_9ebc8defd368bfbada61840691b" FOREIGN KEY ("blockerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_d5c13d1ced558f476dd2268c4eb" FOREIGN KEY ("blockedId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_d5c13d1ced558f476dd2268c4eb"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_9ebc8defd368bfbada61840691b"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dm_permission"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "comment_permission"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "anonymous_mode"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5c13d1ced558f476dd2268c4e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ebc8defd368bfbada61840691"`);
        await queryRunner.query(`DROP TABLE "block"`);
    }

}
