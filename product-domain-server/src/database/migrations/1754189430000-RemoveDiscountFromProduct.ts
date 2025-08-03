import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDiscountFromProduct1754189430000 implements MigrationInterface {
    name = 'RemoveDiscountFromProduct1754189430000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove discount column from products table
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "discount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back discount column if needed to rollback
        await queryRunner.query(`ALTER TABLE "products" ADD "discount" integer NOT NULL DEFAULT 0`);
    }

}