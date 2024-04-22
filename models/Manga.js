// Manga.js
import mongoose from 'mongoose';

const mangaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString()},
  title: { type: String, required: true },
  altTitles: [{ type: String , required: true}],
  malId: { type: Number, required: true },
  trailer: {
    id: { type: String },
    site: { type: String },
    thumbnail: { type: String },
  },
  image: { type: String, required: true },
  popularity: { type: Number, required: true },
  color: { type: String },
  description: { type: String, required: true },
  status: { type: String, required: true },
  releaseDate: { type: Number },
  startDate: {
    year: { type: Number },
    month: { type: Number },
    day: { type: Number },
  },
  endDate: {
    year: { type: Number },
    month: { type: Number },
    day: { type: Number },
  },
  rating: { type: Number, required: true },
  genres: { type: [String], required: true },
  season: { type: String },
  studios: { type: [String] },
  type: { type: String, required: true },
  recommendations: {
    id: { type: String },
    malId: { type: String },
    title: { type: [String] },
    status: { type: String },
    chapters: { type: Number },
    image: { type: String },
    cover: { type: String },
    rating: { type: Number },
    type: { type: String },
  },
  characters: [
    {
      id: { type: String },
      role: { type: String },
      name: { type: [String] },
      image: { type: String },
    },
  ],
  relations: [
    {
      id: { type: Number },
      relationType: { type: String },
      malId: { type: Number },
      title: { type: [String] },
      status: { type: String },
      chapters: { type: Number },
      image: { type: String },
      color: { type: String },
      type: { type: String },
      cover: { type: String },
      rating: { type: Number },
    },
  ],
  chapters: [
    {
      id: { type: String },
      title: { type: String },
      chapter: { type: String },
    },
  ],
});

export default mongoose.model('Manga', mangaSchema);