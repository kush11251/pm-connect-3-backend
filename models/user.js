
const mongoose = require('mongoose');


const { v4: uuidv4 } = require('uuid');
const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, default: uuidv4 },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'others'] },
  post: { type: String },
  role: { type: String },
  project: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  cabStatus: { type: String },
  cabDetail: { type: Object },
  userPreference: { type: String, enum: ['pending', 'done', 'active'], default: 'pending' },
    userImage: { type: String, default: 'https://res.cloudinary.com/db5wkftfk/image/upload/v1758762573/app_uploads/z5an954xmn9zylti9fmp.png' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
