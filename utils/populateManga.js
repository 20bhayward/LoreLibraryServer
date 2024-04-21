import axios from 'axios';
import Manga from '../models/Manga.js';

const API_BASE_URL = 'https://consumet-api.onrender.com/meta/anilist/';

const fetchAndSaveManga = async (endpoint) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        const mangaList = response.data.results || response.data.data;

        for (const mangaData of mangaList) {
            await Manga.createIndexes({ id: 1 });
            const existingManga = await Manga.findOne({ id: mangaData.id });

            if (!existingManga) {
                const manga = new Manga({
                    id: mangaData.id,
                    title: mangaData.title.romaji || mangaData.title.english || mangaData.title.native,
                    altTitles: mangaData.title,
                    malId: mangaData.malId,
                    image: mangaData.image,
                    popularity: mangaData.popularity,
                    color: mangaData.color,
                    description: mangaData.description,
                    status: mangaData.status,
                    rating: mangaData.rating,
                    genres: mangaData.genres,
                    type: mangaData.type,
                });

                await manga.save();
                console.log(`Manga with ID ${mangaData.id} saved successfully.`);
            } else {
                console.log(`Manga with ID ${mangaData.id} already exists. Skipping...`);
            }
        }
    } catch (error) {
        console.error(`Error fetching and saving manga from endpoint ${endpoint}:`, error);
    }
};

const endpoints = [
    'trending?page=1&perPage=20',
    'popular?page=1&perPage=20',
    'advanced-search?genre=action&page=1&perPage=20',
    'advanced-search?genre=adventure&page=1&perPage=20',
    'advanced-search?genre=comedy&page=1&perPage=20',
    // Add more endpoints as needed
];

const populateManga = async () => {
    for (const endpoint of endpoints) {
        try {
            await fetchAndSaveManga(endpoint);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error fetching and saving manga from endpoint ${endpoint}:`, error);
        }
    }
    console.log('Manga population completed.');
};

populateManga();