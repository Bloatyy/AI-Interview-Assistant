const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../models/User');

// Configure Brevo (Sendinblue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      isVerified: false
    });

    // Send Magic Link via Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify/${verificationToken}`;

    sendSmtpEmail.subject = "Verify your InterviewMitra Account";
    sendSmtpEmail.htmlContent = `<html><body><h1>Welcome ${name}!</h1><p>Please verify your account by clicking the link below:</p><a href="${verificationUrl}">${verificationUrl}</a></body></html>`;
    sendSmtpEmail.sender = { "name": "InterviewMitra", "email": "no-reply@interviewmitra.com" };
    sendSmtpEmail.to = [{ "email": email, "name": name }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(201).json({ message: 'Signup successful! Please check your email for the magic link.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send('Invalid or expired link');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/signin?verified=true`);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
});

module.exports = router;
