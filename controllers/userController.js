import bcrypt from 'bcrypt';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import Manga from '../models/Manga.js';
import Comment from '../models/Comment.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const profilePicturesDir = path.join(path.resolve(), 'uploads', 'profile-pictures');

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      location: user.location,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req._id;
  const { firstName, lastName, gender, location } = req.body;
  const username = req.body.username || '';

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.gender = gender || user.gender;
    user.location = location || user.location;

    if (req.file) {
      // Move the uploaded file to the persistent directory
      const originalPath = req.file.path;
      const extension = path.extname(req.file.originalname);
      const newFileName = `${userId}${extension}`;
      const newFilePath = path.join(profilePicturesDir, newFileName);

      // Create the directory if it doesn't exist
      fs.mkdirSync(profilePicturesDir, { recursive: true });

      // Move the file to the new location
      fs.renameSync(originalPath, newFilePath);

      // Store the new file path in the database
      user.profilePicture = `/uploads/profile-pictures/${newFileName}`;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

};

const createBareManga = async (id, title, image) => {
  try {
    const newManga = new Manga({
      id,
      title,
      image,
      altTitles: [],
      malId: 0,
      popularity: 0,
      description: '',
      status: '',
      rating: 0,
      genres: [],
      type: '',
    });
    await newManga.save();
    console.log('New manga created:', newManga);
  } catch (error) {
    console.error('Error creating new manga:', error);
  }
};

export const followManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const { title, image } = req.body;

    console.log('Following manga:', mangaId, 'for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.followedManga.includes(mangaId)) {
      user.followedManga.push(mangaId);
      await user.save();

      console.log('User updated, following manga:', mangaId, 'for user:', userId);

      const existingManga = await Manga.findOne({ id: mangaId });

      if (!existingManga) {
        console.log('Manga does not exist, creating new entry:', mangaId);
        await createBareManga(mangaId, title.english, image);
      } else {
        console.log('Manga already exists:', mangaId);
      }
    } else {
      console.log('User is already following manga:', mangaId, 'for user:', userId);
    }

    res.json({ message: 'Manga followed successfully' });
  } catch (error) {
    console.error('Error following manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const favoriteManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const { title, image } = req.body;

    console.log('Favoriting manga:', mangaId, 'for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favoriteManga.includes(mangaId)) {
      user.favoriteManga.push(mangaId);
      await user.save();

      console.log('User updated, favoriting manga:', mangaId, 'for user:', userId);

      const existingManga = await Manga.findOne({ id: mangaId });

      if (!existingManga) {
        console.log('Manga does not exist, creating new entry:', mangaId);
        await createBareManga(mangaId, title.english, image);
      } else {
        console.log('Manga already exists:', mangaId);
      }
    } else {
      console.log('User has already favorited manga:', mangaId, 'for user:', userId);
    }

    res.json({ message: 'Manga favorited successfully' });
  } catch (error) {
    console.error('Error favoriting manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const readingManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const { title, image } = req.body;

    console.log('Adding manga to reading list:', mangaId, 'for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.readingManga.includes(mangaId)) {
      user.readingManga.push(mangaId);
      await user.save();

      console.log('User updated, adding manga to reading list:', mangaId, 'for user:', userId);

      const existingManga = await Manga.findOne({ id: mangaId });

      if (!existingManga) {
        console.log('Manga does not exist, creating new entry:', mangaId);
        await createBareManga(mangaId, title.english, image);
      } else {
        console.log('Manga already exists:', mangaId);
      }
    } else {
      console.log('Manga is already in the reading list:', mangaId, 'for user:', userId);
    }

    res.json({ message: 'Manga added to reading list' });
  } catch (error) {
    console.error('Error marking manga as reading:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unFollowManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.followedManga = user.followedManga.filter((id) => id !== mangaId);
    await user.save();
    res.json({ message: 'Manga unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unFavoriteManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.favoriteManga = user.favoriteManga.filter((id) => id !== mangaId);
    await user.save();
    res.json({ message: 'Manga unfavorited successfully' });
  } catch (error) {
    console.error('Error unfavoriting manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unReadingManga = async (req, res) => {
  try {
    const userId = req.user._id;
    const mangaId = req.params.mangaId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.readingManga = user.readingManga.filter((id) => id !== mangaId);
    await user.save();
    res.json({ message: 'Manga removed from reading list' });
  } catch (error) {
    console.error('Error removing manga from reading list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfileComments = async (req, res) => {
  try {
    const { _id } = req.params;
    const comments = await Comment.find({ profileId: _id }).exec();
    res.json(comments);
  } catch (error) {
    console.error('Error fetching profile comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitProfileComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const { commenterUniqueId, commenterUsername, comment } = req.body;
    const newComment = new Comment({
      uniqueId: commenterUniqueId,
      username: commenterUsername,
      comment,
      profileId: _id.toString(),
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error submitting profile comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserManga = async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById(userId).populate('followedManga favoriteManga readingManga');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followedManga = await Manga.findOne({ _id: { $in: user.followedManga } });
    const favoriteManga = await Manga.findOne({ _id: { $in: user.favoriteManga } });
    const readingManga = await Manga.findOne({ _id: { $in: user.readingManga } });

    res.json({
      followedManga,
      favoriteManga,
      readingManga,
    });
  } catch (error) {
    console.error('Error fetching user manga:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};