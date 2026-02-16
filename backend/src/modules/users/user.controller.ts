import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();

import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";

import generateJWT from "../../utils/generatejwt.ts";
import { sendWelcomeMail } from "../../utils/mailer.ts";
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
