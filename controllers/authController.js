import bcrypt from 'bcrypt';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Invalid username. Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });
    const savedUser = await newUser.save();
    console.log(savedUser._id);
    req.session.currentUser = {
      _id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
      profilePicture: savedUser.profilePicture || '',
    };
    if (!req.session) {
      return res.status(500).json({ message: 'Session not available' });
    }
    res.status(201).json({
      message: 'User registered successfully',
      user: req.session.currentUser,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }
    if (isPasswordValid) {
      req.session.currentUser = {
        _id: user._id,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture,
      };
      if (!req.session) {
        return res.status(500).json({ message: 'Session not available' });
      }
      res.json({
        message: 'Login successful',
        user: req.session.currentUser,
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logout successful' });
  });
}; 