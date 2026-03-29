import nodemailer from "nodemailer";
import CONFIG from "../config.js";

const transporter = nodemailer.createTransport({
    host: CONFIG.emailHost,
    port: CONFIG.emailPort,
    secure: CONFIG.emailPort === 465,
    requireTLS: CONFIG.emailPort === 587,
    auth: {
        user: CONFIG.emailUser,
        pass: CONFIG.emailPass,
    },
});

function buildHtmlContent(content: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <body style="font-family:Calibri,sans-serif;max-width:560px;margin:auto;padding:24px;">
            ${content}
        </body>
        </html>
    `;
}

export async function sendVerificationEmail(to: string, username: string, token: string): Promise<void> {
    const link = `${CONFIG.clientUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: CONFIG.emailUser,
        to,
        subject: "Confirm your email - API Hub",
        html: buildHtmlContent(`
            <p>Hi, <strong>${username}</strong>,</p>
            <p>Thanks for registering. Click the link below to confirm your email address:</p>
            <p><a href="${link}">${link}</a></p>
            <p>The link expires in 24 hours. If you did not create an account, ignore this email.</p>
        `),
    });
}

export async function sendPasswordResetEmail(to: string, username: string, token: string): Promise<void> {
    const link = `${CONFIG.clientUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: CONFIG.emailUser,
        to,
        subject: "Reset your password - API Hub",
        html: buildHtmlContent(`
            <p>Hi, <strong>${username}</strong>,</p>
            <p>We received a request to reset your password. Click the link below to choose a new one:</p>
            <p><a href="${link}">${link}</a></p>
            <p>The link expires in 1 hour. If you did not request a password reset, ignore this email.</p>
        `),
    });
}

export async function sendProposalApprovedEmail(to: string, username: string, proposalName: string): Promise<void> {
    await transporter.sendMail({
        from: CONFIG.emailUser,
        to,
        subject: "Your proposal was approved - API Hub",
        html: buildHtmlContent(`
            <p>Hi, <strong>${username}</strong>,</p>
            <p>Great news! Your API proposal <strong>${proposalName}</strong> has been reviewed and approved.</p>
        `),
    });
}

export async function sendProposalRejectedEmail(
    to: string,
    username: string,
    proposalName: string,
    adminNote: string,
): Promise<void> {
    await transporter.sendMail({
        from: CONFIG.emailUser,
        to,
        subject: "Your proposal was not approved - API Hub",
        html: buildHtmlContent(`
            <p>Hi, <strong>${username}</strong>,</p>
            <p>Your API proposal <strong>${proposalName}</strong> has been reviewed and was not approved.</p>
            <p><strong>Reason:</strong> ${adminNote}</p>
            <p>You are welcome to submit a revised proposal at any time.</p>
        `),
    });
}