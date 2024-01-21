import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

config();
const configService = new ConfigService();

export const jwtConstants = {
  secret: configService.getOrThrow('JWT_SECRET'),
};

export const profile_image_size = configService.getOrThrow('PROFILE_IMAGE_SIZE')