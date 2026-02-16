import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const options = {
  expiresIn: 3600,
};

async function generateJWT({ email, userId }: { email: string; userId: string }) {
  const payload = { email, id: userId };

  const token =jwt.sign(payload, JWT_SECRET, options);

  return token;
}
export default generateJWT;