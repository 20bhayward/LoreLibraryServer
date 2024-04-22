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
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  gender: { type: String, default: '' },
  location: { type: String, default: '' },
  followedManga: [{ type: String }],
  favoriteManga: [{ type: String }],
  readingManga: [{ type: String }],
});

export default mongoose.model('User', userSchema);