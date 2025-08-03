import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerIdToProduct1754189330553 implements MigrationInterface {
    name = 'AddSellerIdToProduct1754189330553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add sellerId column to products table
        await queryRunner.query(`ALTER TABLE "products" ADD "sellerId" varchar(100) NOT NULL DEFAULT ''`);
        
        // Create index on sellerId and isActive
        await queryRunner.query(`CREATE INDEX "IDX_products_sellerId_isActive" ON "products" ("sellerId", "isActive")`);
        
        // Update existing records with a default sellerId (optional - you may want to handle this differently)
        await queryRunner.query(`UPDATE "products" SET "sellerId" = 'default-seller' WHERE "sellerId" = ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.query(`DROP INDEX "IDX_products_sellerId_isActive"`);
        
        // Drop the sellerId column
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sellerId"`);
    }

}
