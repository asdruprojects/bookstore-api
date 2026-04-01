import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Book } from './modules/books/entities/book.entity';
import { InitialBooks1743612000000 } from './migrations/1743612000000-InitialBooks';

config({ path: join(__dirname, '..', '.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Book],
  migrations: [InitialBooks1743612000000],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
