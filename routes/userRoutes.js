import express from 'express';
import { updateProfile, getUserProfile, changePassword, followManga, favoriteManga, readingManga, getProfileComments, submitProfileComment, getUserManga } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import User from '../models/User.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/:_id/manga', authMiddleware, getUserManga);
router.post('/:_id/follow/:mangaId', authMiddleware, followManga);
router.post('/:_id/favorite/:mangaId', authMiddleware, favoriteManga);
router.post('/:_id/reading/:mangaId', authMiddleware, readingManga);
router.get('/profile/:_id/comments', getProfileComments);
router.post('/profile/:_id/comments', submitProfileComment);

export default router;