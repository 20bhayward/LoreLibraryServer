import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  username: { type: String, required: true },
  comment: { type: String, required: true },
  profileId: { type: String, required: true },
});

export default mongoose.model('Comment', commentSchema);