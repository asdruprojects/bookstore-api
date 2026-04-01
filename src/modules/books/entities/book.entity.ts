import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  author: string;

  @Column({ type: 'text' })
  isbn: string;

  @Column({ type: 'decimal', precision: 14, scale: 4, name: 'cost_usd' })
  costUsd: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 4,
    name: 'selling_price_local',
    nullable: true,
  })
  sellingPriceLocal: string | null;

  @Column({ type: 'int', name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'text', name: 'supplier_country' })
  supplierCountry: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
