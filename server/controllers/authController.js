const User = require('../models/User');
const TokenService = require('../services/tokenService');
const { sanitizeUser } = require('../utils/helpers');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await User.create({ email, password, name });
      const accessToken = TokenService.generateAccessToken(user.id);
      const refreshToken = TokenService.generateRefreshToken(user.id);

      res.status(201).json({
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const accessToken = TokenService.generateAccessToken(user.id);
      const refreshToken = TokenService.generateRefreshToken(user.id);

      res.json({
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const decoded = TokenService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const accessToken = TokenService.generateAccessToken(user.id);
      const newRefreshToken = TokenService.generateRefreshToken(user.id);

      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  async logout(req, res, next) {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
