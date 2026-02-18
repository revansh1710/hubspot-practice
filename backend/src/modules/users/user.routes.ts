import { Router } from "express";
import {
  Signup,
  Activate,
  Login,
  forgotPassword,
  logout,
} from "./user.controller.ts";

import { validateToken } from "../../middleware/config/auth.middleware.ts";

const router = Router();

/**
 * @route   POST /api/users/signup
 * @desc    Register new user
 */
router.post("/signup", Signup);

/**
 * @route   POST /api/users/activate
 * @desc    Activate account via email OTP
 */
router.post("/activate", Activate);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user
 */
router.post("/login", Login);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Send password reset OTP
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/users/logout
 * @desc    Logout user (requires auth)
 */
router.post("/logout", validateToken, logout);

export default router;
