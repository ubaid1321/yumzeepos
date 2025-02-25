const express = require("express");
const passport = require("passport");
const sendWelcomeEmail = require("../utils/mailer");
const User = require("../models/User"); 
const router = express.Router();
require("dotenv").config();

// 🔹 Start Google OAuth Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔹 Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    if (req.user) {
      try {
        // Check if user already exists in SQL database
        const existingUser = await User.findOne({ where: { email: req.user.email } });

        if (!existingUser) {
          // New user detected: Send Welcome Email
          await sendWelcomeEmail(req.user.email, req.user.displayName);

          // Save new user to database
          await User.create({
            email: req.user.email,
            name: req.user.displayName,
            googleId: req.user.id, // Store Google ID if using OAuth
          });
        }

        // Redirect to frontend home page after login
        res.redirect(`${process.env.FRONTEND_URL}/home`);
      } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/`);
      }
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/`);
      }
      
    }
  
);

// 🔹 Get User Session (Check if user is logged in)
router.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null, message: "Unauthorized" });
  }
});

// 🔹 Logout User
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    req.session.destroy(() => {
      res.clearCookie("connect.sid", { path: "/", httpOnly: true, sameSite: "None", secure: true });

      res.status(200).json({ message: "Logout successful" });
    });
  });
});

module.exports = router;
