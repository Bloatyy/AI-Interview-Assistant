const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: send verification email via Brevo (initialized lazily per-call)
async function sendVerificationEmail(email, name, verificationToken) {
  const axios = require('axios');
  const key = process.env.BREVO_API_KEY;
  
  const verificationUrl = `${process.env.BACKEND_URL}api/auth/verify/${verificationToken}`;

  const data = {
    subject: 'Verify your InterviewMitra Account',
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; background:#0a0a0a; color:#fff; padding:2rem;">
          <h1 style="color:#ffb800;">Welcome to InterviewMitra, ${name}!</h1>
          <p>Click the button below to verify your account and start your journey:</p>
          <a href="${verificationUrl}" 
             style="display:inline-block;margin-top:1rem;padding:0.75rem 2rem;background:#ffb800;color:#000;font-weight:700;border-radius:8px;text-decoration:none;">
            Verify My Account
          </a>
          <p style="margin-top:2rem;font-size:0.8rem;color:#666;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
    sender: { name: 'InterviewMitra', email: 'noreply.hoyjob@gmail.com' },
    to: [{ email, name }]
  };

  await axios.post('https://api.brevo.com/v3/smtp/email', data, {
    headers: {
      'api-key': key,
      'Content-Type': 'application/json'
    }
  });
}

// @route POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  let createdUser = null;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }
    // If user exists but is unverified, delete and re-create so they can retry
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    createdUser = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      isVerified: false,
    });

    // Send the magic link — if this fails, we'll clean up the user
    await sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      message: 'Account created! Please check your email and click the verification link to activate your account.',
    });
  } catch (err) {
    console.error('Signup error:', err?.response?.text || err.message || err);

    // Clean up the DB record if email failed so user can retry
    if (createdUser) {
      await User.deleteOne({ _id: createdUser._id }).catch(() => {});
    }

    const errorDetail = err?.response?.text
      ? JSON.parse(err.response.text)?.message
      : err.message;

    res.status(500).json({
      message: `Signup failed: ${errorDetail || 'Unknown error. Please try again.'}`,
    });
  }
});

// @route GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).send('This verification link is invalid or has already been used.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to frontend with success flag so the modal auto-opens
    res.redirect(`${process.env.FRONTEND_URL}?verified=true`);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).send('Server Error during verification. Please try again.');
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with this email.' });

    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Your email is not verified yet. Please check your inbox and click the verification link.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password.' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}auth-success?token=${token}`);
});

module.exports = router;
