import express from 'express';
import { updateProfile, getUserProfile, changePassword, followManga, favoriteManga, readingManga, getProfileComments, submitProfileComment, getUserManga  } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/:userId/manga', authMiddleware, getUserManga);
router.post('/:userId/follow/:mangaId', authMiddleware, followManga);
router.post('/:userId/favorite/:mangaId', authMiddleware, favoriteManga);
router.post('/:userId/reading/:mangaId', authMiddleware, readingManga);
router.get('/profile/:uniqueId/comments', getProfileComments);
router.post('/profile/:uniqueId/comments', submitProfileComment);

export default router;