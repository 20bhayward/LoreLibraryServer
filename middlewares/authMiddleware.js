import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token); // Add this logging statement

    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    // Verify the token
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Add this logging statement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Add this logging statement

    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }

    // Add the user object to the request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};