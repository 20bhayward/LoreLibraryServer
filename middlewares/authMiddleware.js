import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const sessionUser = req.session.currentUser;
    if (!sessionUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ uniqueId: sessionUser.uniqueId });
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