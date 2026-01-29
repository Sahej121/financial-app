const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const zxcvbn = require('zxcvbn');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized' });
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role = 'user' } = req.body;

    // Password strength check
    const strength = zxcvbn(password);
    if (strength.score < 2) {
      return res.status(400).json({
        error: 'Password is too weak',
        suggestions: strength.feedback.suggestions
      });
    }

    // Validate role is allowed
    const allowedRoles = ['user', 'premium', 'ca', 'financial_planner', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: req.body.phone,
      caNumber: req.body.caNumber
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorAuth: user.twoFactorAuth,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        marketingEmails: user.marketingEmails,
        darkTheme: user.darkTheme,
        clientType: user.clientType,
        residentStatus: user.residentStatus,
        pan: user.pan,
        aadhaar: user.aadhaar,
        city: user.city,
        state: user.state,
        industry: user.industry,
        turnoverBand: user.turnoverBand,
        incomeSources: user.incomeSources,
        accountingMethod: user.accountingMethod,
        hasPastNotices: user.hasPastNotices,
        hasPendingFilings: user.hasPendingFilings,
        hasLoans: user.hasLoans,
        hasCryptoForeignAssets: user.hasCryptoForeignAssets,
        isCashHeavy: user.isCashHeavy,
        riskScore: user.riskScore
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to database
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Ideally, send email here. For now, we return the token for testing.
    // In production, you would use nodemailer to send currentUrl + /reset-password/ + resetToken

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);

    res.status(200).json({
      success: true,
      data: 'Email sent (Mocked: Check server console for link)',
      resetUrl // Including this for easier testing by the user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        twoFactorAuth: req.user.twoFactorAuth,
        emailNotifications: req.user.emailNotifications,
        pushNotifications: req.user.pushNotifications,
        marketingEmails: req.user.marketingEmails,
        darkTheme: req.user.darkTheme,
        clientType: req.user.clientType,
        residentStatus: req.user.residentStatus,
        pan: req.user.pan,
        aadhaar: req.user.aadhaar,
        city: req.user.city,
        state: req.user.state,
        industry: req.user.industry,
        turnoverBand: req.user.turnoverBand,
        incomeSources: req.user.incomeSources,
        accountingMethod: req.user.accountingMethod,
        hasPastNotices: req.user.hasPastNotices,
        hasPendingFilings: req.user.hasPendingFilings,
        hasLoans: req.user.hasLoans,
        hasCryptoForeignAssets: req.user.hasCryptoForeignAssets,
        isCashHeavy: req.user.isCashHeavy,
        riskScore: req.user.riskScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { twoFactorAuth, emailNotifications, pushNotifications, marketingEmails, darkTheme } = req.body;
    const user = req.user;

    if (twoFactorAuth !== undefined) user.twoFactorAuth = twoFactorAuth;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;
    if (marketingEmails !== undefined) user.marketingEmails = marketingEmails;
    if (darkTheme !== undefined) user.darkTheme = darkTheme;

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        twoFactorAuth: user.twoFactorAuth,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        marketingEmails: user.marketingEmails,
        darkTheme: user.darkTheme
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ where: { [Op.or]: [{ googleId }, { email }] } });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        role: 'user'
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const jwtToken = generateToken(user);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture
      },
      token: jwtToken
    });
  } catch (error) {
    res.status(400).json({ error: 'Google authentication failed: ' + error.message });
  }
};

exports.appleLogin = async (req, res) => {
  try {
    const { identityToken, user: appleUserData } = req.body;
    const decodedToken = jwt.decode(identityToken);
    const appleId = decodedToken.sub;
    const email = decodedToken.email;

    let user = await User.findOne({ where: { [Op.or]: [{ appleId }, { email }] } });

    if (!user) {
      user = await User.create({
        name: appleUserData?.name?.firstName || email?.split('@')[0] || 'Apple User',
        email,
        appleId,
        role: 'user'
      });
    } else if (!user.appleId) {
      user.appleId = appleId;
      await user.save();
    }

    const jwtToken = generateToken(user);
    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(400).json({ error: 'Apple authentication failed: ' + error.message });
  }
};