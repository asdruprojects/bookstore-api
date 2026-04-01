import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialBooks1743612000000 implements MigrationInterface {
  name = 'InitialBooks1743612000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "books" (
        "id" SERIAL NOT NULL,
        "title" text NOT NULL,
        "author" text NOT NULL,
        "isbn" text NOT NULL,
        "cost_usd" numeric(14,4) NOT NULL,
        "selling_price_local" numeric(14,4),
        "stock_quantity" integer NOT NULL,
        "category" text NOT NULL,
        "supplier_country" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_books_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_books_isbn_active_true" ON "books" ("isbn") WHERE "active" = true
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_books_category" ON "books" ("category")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_books_stock" ON "books" ("stock_quantity")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`);
  }
}
