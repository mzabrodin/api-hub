import "dotenv/config";

function getEnvironmentString(name: string, defaultValue?: string): string {
    const value = process.env[name] ?? defaultValue;

    if (value === undefined || value.trim() === "") {
        throw new Error(`Environment variable ${name} is required and cannot be empty`);
    }

    return value;
}

function getEnvironmentNumber(name: string, defaultValue?: string): number {
    const stringValue = getEnvironmentString(name, defaultValue);
    const parsedValue = parseInt(stringValue, 10);

    if (Number.isNaN(parsedValue)) {
        throw new Error(`Environment variable ${name} must be a valid number. Got: ${stringValue}`);
    }

    return parsedValue;
}

type NodeEnvironment = "dev" | "production" | "test";

const CONFIG = {
    port: getEnvironmentNumber("PORT", "8080"),
    nodeEnv: getEnvironmentString("NODE_ENV", "dev") as NodeEnvironment,
    clientUrl: getEnvironmentString("CLIENT_URL"),

    jwtAccessSecret: getEnvironmentString("JWT_ACCESS_SECRET"),
    jwtAccessExpiresIn: getEnvironmentString("JWT_ACCESS_EXPIRES_IN", "15m"),

    jwtRefreshSecret: getEnvironmentString("JWT_REFRESH_SECRET"),
    jwtRefreshExpiresIn: getEnvironmentString("JWT_REFRESH_EXPIRES_IN", "7d"),

    jwtVerifyEmailExpiresIn: getEnvironmentString("JWT_VERIFY_EMAIL_EXPIRES_IN", "24h"),
    jwtResetPasswordExpiresIn: getEnvironmentString("JWT_RESET_PASSWORD_EXPIRES_IN", "1h"),

    jwtOneTimeSecret: getEnvironmentString("JWT_ONE_TIME_SECRET"),

    emailHost: getEnvironmentString("EMAIL_HOST"),
    emailPort: getEnvironmentNumber("EMAIL_PORT", "587"),
    emailUser: getEnvironmentString("EMAIL_USER"),
    emailPass: getEnvironmentString("EMAIL_PASSWORD"),
} as const;

export default CONFIG;