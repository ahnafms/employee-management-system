import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
  entities: [__dirname + "/database/entities/*.{ts,js}"],
  migrations: [__dirname + "/database/migrations/*.{ts,js}"],
  subscribers: [__dirname + "/database/subscribers/*.{ts,js}"],
});
