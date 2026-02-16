import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
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

export const sendLoginMail = async ({ to, name }: MailParams) => {
  const info = await transporter.sendMail({
    from: `"Login Team" <${process.env.SMTP_USER}>`,
    to,
    subject: "Login Successful 🚀",
    text: `Hi ${name}, you have successfully logged in.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px; border-radius:8px; max-width:600px; margin:auto;">
        <h1 style="color:#38bdf8; text-align:center;">Hubspot Login</h1>
        <h2>Hi ${name},</h2>
        <p>You have successfully logged into <strong>Hubspot Practice</strong>.</p>
        <p>Let your curiosity orbit the Hubspot 🚀</p>
        <p style="font-size:12px; color:#94a3b8;">— Kaushik Patil</p>
      </div>
    `,
  });

  return info;
};
