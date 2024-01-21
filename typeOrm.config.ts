import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { Role } from "./src/auth/entities/role.entity";
import { User } from "./src/users/entities/user.entity";
import { DataSource } from "typeorm";

config();
const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DATABASE_HOST'),
  port: +configService.getOrThrow('DATABASE_PORT'),
  username: configService.getOrThrow('DATABASE_USER'),
  password: configService.getOrThrow('DATABASE_PASSWORD'),
  database: configService.getOrThrow('DATABASE_NAME'),
  migrations: ['migrations/**'],
  entities: [User, Role]
})