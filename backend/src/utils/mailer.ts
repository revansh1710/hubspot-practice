import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
});

type MailParams = {
  to: string;
  name: string;
  code?: string;
};

export const sendWelcomeMail = async ({ to, name, code }: MailParams) => {
  const info = await transporter.sendMail({
    from: `"Cosmoscope Team" <${process.env.SMTP_USER}>`,
    to,
    subject: "🚀 Welcome to HUBSPOT PRACTICE!",
    text: `Hi ${name}, Your authentication code is ${code}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px; border-radius:8px; max-width:600px; margin:auto;">
        <h1 style="color:#38bdf8; text-align:center;">Hubspot Practice</h1>
        <h2>Hi ${name},</h2>
        <p>Your authentication code is:</p>
        <div style="font-size:28px; font-weight:bold; letter-spacing:4px; margin:16px 0;">
          ${code ?? "XXXXXX"}
        </div>
        <p style="font-size:12px; color:#94a3b8;">If you didn’t request this, ignore this email.</p>
      </div>
    `,
  });

  return info;
};

export const sendPasswordResetMail = async ({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) => {
  return transporter.sendMail({
    from: `"Security Team" <${process.env.SMTP_USER}>`,
    to,
    subject: "🔐 Password Reset Request",
    text: `Your password reset code is ${code}`,
    html: `
      <div style="font-family:Arial; padding:24px; background:#0f172a; color:#e2e8f0;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing:4px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
