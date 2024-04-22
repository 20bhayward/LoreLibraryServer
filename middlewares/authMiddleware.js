import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};