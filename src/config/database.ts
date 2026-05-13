// src/config/Database.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export class Database {
  private static dataSource: DataSource;

  public static getDataSource(): DataSource {
    if (!Database.dataSource) {
      Database.dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        synchronize: true, // Set to false in production
        logging: false,
        entities: [User],
        migrations: [],
        subscribers: [],
      });
    }

    return Database.dataSource;
  }

  public static async initialize(): Promise<void> {
    const dataSource = Database.getDataSource();
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✅ Database initialized successfully');
    }
  }

  public static async destroy(): Promise<void> {
    const dataSource = Database.getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🛑 Database connection closed');
    }
  }
}
