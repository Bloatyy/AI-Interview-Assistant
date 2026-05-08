require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
require('./config/passport');

const app = express();

console.log("BACKEND STARTUP: BREVO_API_KEY =", process.env.BREVO_API_KEY ? "FOUND (starts with " + process.env.BREVO_API_KEY.substring(0,5) + ")" : "MISSING");

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/did', require('./routes/did'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth Server running on port ${PORT}`));
