import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mangaRoutes from './routes/mangaRoutes.js'; // Import manga routes
import bcrypt from 'bcrypt';
import User from './models/User.js';
import multer from 'multer';
import path from 'path';
import { logout } from './controllers/authController.js';
import Review from './models/Review.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { getUserProfile, getProfileComments, submitProfileComment, followManga, favoriteManga, readingManga } from './controllers/userController.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
const allowedOrigins = ['http://localhost:3000', 'https://lorelibrary.netlify.app/','https://consumet-api-z0sh.onrender.com', 'https://consumet-api-z0sh.onrender.com/meta/anilist/' ]; // Add your React app's origin(s) here

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(session({
  secret: 'lore-master-reads-no-lore',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
}));

// Connect to MongoDB
mongoose.connect('mongodb+srv://20bhayward:LoreMaster@lorelibrarydata.tbi2ztc.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', authRoutes);
app.post('/api/auth/logout', logout);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use('/uploads/profile-pictures', express.static(path.join(path.resolve(), 'uploads', 'profile-pictures')));
app.use('/api/manga', mangaRoutes); // Use manga routes

app.get('/api/users/profile', authMiddleware, getUserProfile);

// Route for profile picture upload
app.post('/api/users/profile/picture', upload.single('profilePicture'), async (req, res) => {
  try {
    // Handle the uploaded file and update the user's profile picture
    const userId = req.session.currentUser.uniqueId;
    const filePath = req.file.path;

    // Update the user's profile picture in the database
    await User.findByIdAndUpdate(userId, { profilePicture: filePath });

    res.status(200).json({ message: 'Profile picture uploaded successfully' });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/profile/:uniqueId', async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const user = await User.findOne({ uniqueId })
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
app.get('/api/users/profile/:uniqueId/comments', getProfileComments);
app.post('/api/users/profile/:uniqueId/comments', submitProfileComment);
// Fetch reviews
app.get('/api/manga/:mangaId/reviews', async (req, res) => {
  try {
    const { mangaId } = req.params;
    const reviews = await Review.find({ mangaId }).exec();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit a review
app.post('/api/manga/:mangaId/reviews', async (req, res) => {
  try {
    const { mangaId } = req.params;
    const { uniqueId, username, rating, comment } = req.body;
    const newReview = new Review({
      uniqueId,
      username,
      rating,
      comment,
      mangaId,
    });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});