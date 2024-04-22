import express from 'express';
import { getMangaDetails, getReviews, submitReview, getFeaturedManga } from '../controllers/mangaController.js';

const router = express.Router();

router.get('/featured', getFeaturedManga);
router.get('/:mangaId', getMangaDetails);
router.get('/:mangaId/reviews', getReviews);
router.post('/:mangaId/reviews', submitReview);

export default router;