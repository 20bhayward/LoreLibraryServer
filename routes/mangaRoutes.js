// mangaRoutes.js
import express from 'express';
import { getMangaDetails, getReviews, submitReview, getFeaturedManga } from '../controllers/mangaController.js';

const router = express.Router();

router.get('/featured', getFeaturedManga);
router.get('/:mangaId', getMangaDetails);
router.get('/:mangaId/reviews', getReviews); // Route for fetching reviews
router.post('/:mangaId/reviews', submitReview); // Route for submitting reviews

export default router;