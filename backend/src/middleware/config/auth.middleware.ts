import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import User from "../../modules/users/user.schema.ts";
import mongoSanitize from "express-mongo-sanitize";
import type { Express } from "express";

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "Access token missing",
      });
    }

    const token = authHeader.split(" ")[1]?.trim(); // ✅ trim added
    req.token = token;

    const user = await User.findOne({ accessToken: token });

    if (!user) {
      return res.status(403).json({
        error: true,
        message: "Invalid session",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (user.userId !== decoded.id) {
      return res.status(401).json({
        error: true,
        message: "Token mismatch",
      });
    }

    req.user = {
      id:user.id,
      userId: user.userId,
      email: decoded.email,
      referralCode: user.referralCode ?? undefined,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: true,
        message: "Token expired",
      });
    }

    return res.status(403).json({
      error: true,
      message: "Authentication failed",
    });
  }
};

export const applySanitizer = (app: Express) => {
  app.use(
    mongoSanitize({
      replaceWith: "_",
    })
  );
};
