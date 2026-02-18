import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";
import generateJWT from '../../utils/generatejwt.ts'
import { sendWelcomeMail, sendPasswordResetMail } from "../../utils/mailer.ts";
import type { Request, Response } from 'express';
import User from "./user.schema.ts";
const CHARACTER_SET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateReferralCode = customAlphabet(CHARACTER_SET, 8);

const userSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(4).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  referrer: Joi.string().optional(),
});

export const Signup = async (req: any, res: any) => {
  try {
    const { value, error } = userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: true,
        message: error.message,
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: value.email });

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "Email already registered",
      });
    }

    // Validate referrer before heavy ops
    if (value.referrer) {
      const referrer = await User.findOne({
        referralCode: value.referrer,
      });

      if (!referrer) {
        return res.status(400).json({
          error: true,
          message: "Invalid referral code",
        });
      }
    }

    // Hash password
    const hashedPassword = await User.hashPassword(value.password);


    // Generate tokens
    const emailToken = Math.floor(100000 + Math.random() * 900000);
    const emailTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Build user payload (don’t mutate Joi value)
    const payload = {
      userId: uuidv4(),
      email: value.email,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      referrer: value.referrer,
      emailToken,
      emailTokenExpires,
    };

    // Send email
    await sendWelcomeMail({
      to: payload.email,
      name: payload.email,
      code: String(emailToken),
    });

    const newUser = new User(payload);
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      referralCode: payload.referralCode,
    });
  } catch (err) {
    console.error("signup-error:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

export const Activate = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: true,
        message: "Please provide email and code",
      });
    }

    const user = await User.findOne({
      email,
      emailToken: code,
      emailTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid or expired code",
      });
    }

    if (user.active) {
      return res.status(409).json({
        error: true,
        message: "Account already activated",
      });
    }

    // ✅ Activate account
    user.active = true;
    user.emailToken = null;
    user.emailTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (error: any) {
    console.error("activation-error", error);

    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Cannot authorize user",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        error: true,
        message: "You must verify your email to activate your account",
      });
    }

    const isValid = await User.comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = await generateJWT(user.email, user.userId);

    if (!token) {
      return res.status(500).json({
        error: true,
        message: "Failed to generate token",
      });
    }
    user.accessToken = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    console.error("login-error:", error);

    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({
        error: true,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Always return generic response (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a password reset code has been sent",
      });
    }

    // 🔐 Generate OTP + expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = code;
    user.resetPasswordExpires = expiry;
    await user.save();

    // 📧 Send email
    await sendPasswordResetMail({
      to: user.email,
      name: user.email,
      code,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("forgot-password-error", error);

    return res.status(500).json({
      error: true,
      message: "Unable to process request",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    const { userId } = req.user;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    user.accessToken = null; // or "" depending on schema
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("logout-error", error);

    return res.status(500).json({
      error: true,
      message: "Logout failed",
    });
  }
};