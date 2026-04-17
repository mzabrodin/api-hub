import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z.enum(["dev", "production", "test"]).default("dev"),
    CLIENT_URL: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    JWT_VERIFY_EMAIL_EXPIRES_IN: z.string().default("24h"),
    JWT_RESET_PASSWORD_EXPIRES_IN: z.string().default("1h"),
    JWT_ONE_TIME_SECRET: z.string().min(1),
    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_USER: z.string().min(1),
    EMAIL_PASSWORD: z.string().min(1),
});

const env = envSchema.parse(process.env);

const CONFIG = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    clientUrl: env.CLIENT_URL,
    databaseUrl: env.DATABASE_URL,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    jwtAccessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    jwtVerifyEmailExpiresIn: env.JWT_VERIFY_EMAIL_EXPIRES_IN,
    jwtResetPasswordExpiresIn: env.JWT_RESET_PASSWORD_EXPIRES_IN,
    jwtOneTimeSecret: env.JWT_ONE_TIME_SECRET,
    emailHost: env.EMAIL_HOST,
    emailPort: env.EMAIL_PORT,
    emailUser: env.EMAIL_USER,
    emailPass: env.EMAIL_PASSWORD,
} as const;

export default CONFIG;
