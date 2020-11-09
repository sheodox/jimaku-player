import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateImage1604889755425 implements MigrationInterface {
    name = 'CreateImage1604889755425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "large" bytea NOT NULL, "medium" bytea NOT NULL, "small" bytea NOT NULL, "sourceId" character varying NOT NULL, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_33dc14c9292e4f0eed3bf664f2" ON "images" ("sourceId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_33dc14c9292e4f0eed3bf664f2"`);
        await queryRunner.query(`DROP TABLE "images"`);
    }

}
