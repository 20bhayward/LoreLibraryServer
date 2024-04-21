import Manga from '../models/Manga.js';
import Review from '../models/Review.js';

const API_BASE_URL = 'https://consumet-api-z0sh.onrender.com/meta/anilist-manga';

export const getReviews = async (req, res) => {
    try {
        const { mangaId } = req.params;
        const reviews = await Review.find({ mangaId }).exec();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitReview = async (req, res) => {
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
};

export const getMangaDetails = async (req, res) => {
    const { mangaId } = req.params;

    try {
        const response = await axios.get(`${API_BASE_URL}/info/${mangaId}?provider=mangareader`);
        const mangaData = response.data;

        // Save the manga data to the database
        const manga = await Manga.findOneAndUpdate(
            { id: mangaData.id },
            {
                title: mangaData.title[0],
                altTitles: mangaData.title,
                malId: mangaData.malId,
                trailer: mangaData.trailer,
                image: mangaData.image,
                popularity: mangaData.popularity,
                color: mangaData.color,
                description: mangaData.description,
                status: mangaData.status,
                releaseDate: mangaData.releaseDate,
                startDate: mangaData.startDate,
                endDate: mangaData.endDate,
                rating: mangaData.rating,
                genres: mangaData.genres,
                season: mangaData.season,
                studios: mangaData.studios,
                type: mangaData.type,
                recommendations: mangaData.recommendations,
                characters: mangaData.characters,
                relations: mangaData.relations,
                chapters: mangaData.chapters,
            },
            { upsert: true, new: true }
        );

        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga details:', error);
        if (error.response) {
            // The request was made, but the server responded with an error
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            res.status(error.response.status).json({ message: error.response.data });
        } else if (error.request) {
            // The request was made, but no response was received
            console.error('No response received:', error.request);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            // Something else happened while setting up the request
            console.error('Error:', error.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

export const getFeaturedManga = async (req, res) => {
  try {
    const response = await axios.get(`https://consumet-api-z0sh.onrender.com/meta/anilist/popular?provider=mangareader`);
    const results = response.data.results;

    // Sort the results by popularity in descending order
    const sortedResults = results.sort((a, b) => b.popularity - a.popularity);

    // Take the top 5 results
    const featuredManga = sortedResults.slice(0, 5);

    res.json(featuredManga);
  } catch (error) {
    console.error('Error fetching featured manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};