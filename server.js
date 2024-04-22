import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mangaRoutes from './routes/mangaRoutes.js';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import { logout } from './controllers/authController.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { getUserProfile, getProfileComments, submitProfileComment, followManga, favoriteManga, readingManga, getUserManga } from './controllers/userController.js';
import "dotenv/config";
import User from '../models/User.js';

const app = express();
const upload = multer({ dest: 'uploads/' });
// Set withCredentials to true for all requests
axios.defaults.withCredentials = true;
// Middleware
const allowedOrigins = ['http://localhost:3000', 'https://main--lorelibrary.netlify.app/', 'https://lorelibraryserver.onrender.com', 'https://consumet-api-z0sh.onrender.com', 'https://consumet-api-z0sh.onrender.com/meta/anilist/popular?provider=mangareader', 'https://consumet-api-z0sh.onrender.com/meta/anilist/'];

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING || 'mongodb+srv://20bhayward:LoreMaster@lorelibrarydata.tbi2ztc.mongodb.net/');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS
    sameSite: 'none', // Necessary for cross-origin use with secure cookies
    domain: process.env.HTTP_SERVER_DOMAIN ? new URL(process.env.HTTP_SERVER_DOMAIN).hostname : undefined,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
  proxy: process.env.NODE_ENV === 'production' // Trust the proxy in production for secure cookies
};
if (process.env.NODE_ENV !== "development") {
  sessionOptions.cookie.secure = true; // Ensure cookies are only sent over HTTPS
  sessionOptions.proxy = true; // Trust the load balancer in production
}

app.use(session(sessionOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.post('/api/auth/logout', logout);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(path.resolve(), 'uploads', 'profile-pictures')));
app.use('/api/manga', mangaRoutes);

app.get('/api/users/profile', authMiddleware, getUserProfile);

// Route for profile picture upload
app.post('/api/users/profile/picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.session.currentUser._id;
    const filePath = req.file.path;

    await User.findByIdAndUpdate(userId, { profilePicture: filePath });

    res.status(200).json({ message: 'Profile picture uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/profile/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById({ _id })
      .select('username profilePicture firstName lastName gender location')
      .populate('followedManga favoriteManga readingManga')
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const publicProfile = {
      username: user.username,
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      location: user.location,
      followedManga: user.followedManga,
      favoriteManga: user.favoriteManga,
      readingManga: user.readingManga,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/:_id/manga', authMiddleware, getUserManga);
app.post('/api/users/:_id/follow/:mangaId', authMiddleware, followManga);
app.post('/api/users/:_id/favorite/:mangaId', authMiddleware, favoriteManga);
app.post('/api/users/:_id/reading/:mangaId', authMiddleware, readingManga);

app.get('/api/users/profile/:_id/comments', getProfileComments);
app.post('/api/users/profile/:_id/comments', submitProfileComment);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});