export const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session.currentUser || !req.session.currentUser._id) {
      return res.status(401).json({ message: 'Please log in to access this resource' });
    }

    const user = await User.findById(req.session.currentUser._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req._id = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};