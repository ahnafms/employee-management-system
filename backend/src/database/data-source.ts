import { DataSource } from "typeorm";
import { join } from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [join(__dirname, "/entities/*.{ts,js}")],
  migrations: [join(__dirname, "/migrations/*.{ts,js}")],
  subscribers: [join(__dirname, "/subscribers/*.{ts,js}")],
});

export class SingletonDb {
  private static instance: SingletonDb;
  private static dataSource: DataSource = AppDataSource;

  public static getConnection(): DataSource {
    if (!SingletonDb.instance) {
      SingletonDb.instance = new SingletonDb();
      SingletonDb.instance = AppDataSource;
    }

    return SingletonDb.dataSource;
  }

  public static async initialize(): Promise<void> {
    if (!SingletonDb.dataSource.isInitialized) {
      await SingletonDb.dataSource.initialize();
    }
  }
}
