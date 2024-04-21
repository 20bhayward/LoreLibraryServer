import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['User', 'Creator', 'Admin'],
    default: 'User'
  },
  profilePicture: { type: String, default: '' },
  uniqueId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  gender: { type: String, default: '' },
  location: { type: String, default: '' },
  followedManga: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manga' }],
  favoriteManga: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manga' }],
  readingManga: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manga' }],
});

export default mongoose.model('User', userSchema);