
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { classifyKalviumEmail } = require('../utils/kalviumIdentity');

const googleClient = new OAuth2Client();

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.JWT_SECRET;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required.'
      });
    }

    if (!clientId || !secret || secret.length < 32) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is not configured.'
      });
    }

    if (User.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: 'A verified Google account is required.'
      });
    }

    const identity = classifyKalviumEmail(payload.email);

    if (!identity) {
      return res.status(403).json({
        success: false,
        message: 'Use a valid Kalvium mentor or student email.'
      });
    }

    let user = await User.findOne({ email: identity.email });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This account is inactive.'
        });
      }

      if (
        user.role !== identity.role ||
        (user.squad || null) !== identity.squad
      ) {
        return res.status(403).json({
          success: false,
          message: 'Account identity does not match the verified email.'
        });
      }

      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(409).json({
          success: false,
          message: 'This email is linked to another Google account.'
        });
      }

      if (!user.googleId) {
        user.googleId = payload.sub;
      }
    
      if (!user.name && payload.name) {
       user.name = payload.name;
      }
     // Google has verified this email.
      
      await user.save();

    } else {
      user = await User.create({
        email: identity.email,
        name: payload.name || identity.email.split('@')[0],
        role: identity.role,
        squad: identity.squad,
        googleId: payload.sub        
      });
    }

    const token = jwt.sign(
      { sub: user.id },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '7d',
        issuer: 'dojo-pulse',
        audience: 'dojo-pulse-mentor-portal'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Google sign-in successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        squad: user.squad
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This account already exists. Please try signing in again.'
      });
    }

    console.error('[Google Auth] Sign-in failed.');

    return res.status(401).json({
      success: false,
      message: 'Google sign-in could not be verified.'
    });
  }
};

module.exports = { googleLogin };
