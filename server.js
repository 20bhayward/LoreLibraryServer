import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mangaRoutes from './routes/mangaRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js'
import multer from 'multer';
import path from 'path';
import "dotenv/config";
import User from './models/User.js'

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://main--lorelibrary.netlify.app/',
  'https://lorelibraryserver.onrender.com',
  'https://consumet-api-z0sh.onrender.com',
  'https://consumet-api-z0sh.onrender.com/meta/anilist/popular?provider=mangareader',
  'https://consumet-api-z0sh.onrender.com/meta/anilist/'
];

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

app.use(express.json());

// Routes
app.use('/api/announcements', announcementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(path.resolve(), 'uploads', 'profile-pictures')));
app.use('/api/manga', mangaRoutes);

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