import argon2 from "argon2";
import jwt, {SignOptions} from "jsonwebtoken";
import CONFIG from "../config.js";
import type JWT from "../types/jwt.js";
import type {RegisterRequest, LoginRequest} from "../schemas/auth.schemas.js";
import type {ChangePasswordRequest} from "../schemas/user.schemas.js";
import {sendVerificationEmail, sendPasswordResetEmail} from "./email.service.js";
import {
    BadRequestError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError,
    UnauthorizedError,
} from "../utils/errors/AppError.js";
import prisma from "../prisma/client.js";
import {User, UserRole} from "../prisma/generated/client.js";

type TokenPurpose = "verify-email" | "reset-password";
type SafeUser = Omit<User, "passwordHash" | "verificationToken" | "passwordResetToken" | "refreshToken">;

function signOneTimeToken(userId: string, purpose: TokenPurpose, expiresIn: string): string {
    return jwt.sign({userId, purpose}, CONFIG.jwtSecret, {expiresIn} as SignOptions);
}

function verifyOneTimeToken(token: string, expectedPurpose: TokenPurpose): string {
    let decoded: { userId: string; purpose: string };
    try {
        decoded = jwt.verify(token, CONFIG.jwtSecret) as typeof decoded;
    } catch {
        throw new BadRequestError("Invalid or expired token");
    }

    if (decoded.purpose !== expectedPurpose) {
        throw new BadRequestError("Invalid or expired token");
    }

    return decoded.userId;
}

function issueTokens(user: { id: string; email: string; role: UserRole }) {
    const payload = {id: user.id, email: user.email, role: user.role};
    const accessToken = jwt.sign(payload, CONFIG.jwtSecret, {
        expiresIn: CONFIG.jwtAccessExpiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, CONFIG.jwtRefreshSecret, {
        expiresIn: CONFIG.jwtRefreshExpiresIn,
    } as SignOptions);

    return {accessToken, refreshToken};
}

function safeUser(user: User): SafeUser {
    const {passwordHash, verificationToken, passwordResetToken, refreshToken, ...rest} = user;
    return rest;
}

export async function register(data: RegisterRequest) {
    const existing = await prisma.user.findUnique({where: {email: data.email}});
    if (existing) {
        throw new ResourceAlreadyExistsError("Email is already registered");
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.user.create({
        data: {email: data.email, username: data.username, passwordHash},
    });

    const verificationToken = signOneTimeToken(user.id, "verify-email", CONFIG.jwtVerifyEmailExpiresIn);
    await prisma.user.update({where: {id: user.id}, data: {verificationToken}});

    await sendVerificationEmail(user.email, user.username, verificationToken);
    return safeUser(user);
}

export async function verifyEmail(token: string) {
    const userId = verifyOneTimeToken(token, "verify-email");

    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user || user.verificationToken !== token) {
        throw new BadRequestError("Invalid or expired verification token");
    }

    if (user.isEmailVerified) {
        throw new BadRequestError("Email is already verified");
    }

    await prisma.user.update({
        where: {id: user.id},
        data: {isEmailVerified: true, verificationToken: null},
    });
}

export async function login(data: LoginRequest) {
    const user = await prisma.user.findUnique({where: {email: data.email}});
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new UnauthorizedError("Please verify your email before logging in");
    }

    const valid = await argon2.verify(user.passwordHash, data.password);
    if (!valid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = issueTokens(user);

    const updatedUser = await prisma.user.update({
        where: {id: user.id},
        data: {refreshToken: tokens.refreshToken},
    });

    return {...tokens, user: safeUser(updatedUser)};
}

export async function refresh(token: string) {
    let decoded: JWT;
    try {
        decoded = jwt.verify(token, CONFIG.jwtRefreshSecret) as JWT;
    } catch {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({where: {id: decoded.id}});
    if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const tokens = issueTokens(user);

    await prisma.user.update({
        where: {id: user.id},
        data: {refreshToken: tokens.refreshToken},
    });

    return tokens;
}

export async function logout(userId: string) {
    await prisma.user.update({
        where: {id: userId},
        data: {refreshToken: null},
    });
}


export async function forgotPassword(email: string) {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) {
        return;
    }

    const passwordResetToken = signOneTimeToken(user.id, "reset-password", CONFIG.jwtResetPasswordExpiresIn);
    await prisma.user.update({
        where: {id: user.id},
        data: {passwordResetToken},
    });

    await sendPasswordResetEmail(user.email, user.username, passwordResetToken);
}

export async function resetPassword(token: string, password: string) {
    const userId = verifyOneTimeToken(token, "reset-password");

    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user || user.passwordResetToken !== token) {
        throw new BadRequestError("Invalid or expired reset token");
    }

    await prisma.user.update({
        where: {id: user.id},
        data: {
            passwordHash: await argon2.hash(password),
            passwordResetToken: null,
        },
    });
}

export async function changePassword(userId: string, data: ChangePasswordRequest) {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) {
        throw new ResourceNotFoundError("User not found");
    }

    const valid = await argon2.verify(user.passwordHash, data.currentPassword);
    if (!valid) {
        throw new UnauthorizedError("Current password is incorrect");
    }

    await prisma.user.update({
        where: {id: userId},
        data: {passwordHash: await argon2.hash(data.newPassword)},
    });
}