import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    mangaId: { type: String, required: true },
});

export default mongoose.model('Review', reviewSchema);
