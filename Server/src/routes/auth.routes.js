import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
import { AuthWithGoogle, getMyProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), AuthWithGoogle)
router.get("/me", authMiddleware, getMyProfile);

export default router