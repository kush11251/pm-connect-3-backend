const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  accommodationRequired: { type: Boolean, required: true },
  arrivalDate: { type: Date, default: null },
  departureDate: { type: Date, default: null },
  foodPreference: { type: String, enum: ['veg', 'non-veg', 'vegan', 'other', 'none'], default: 'none' },
  arrivalPreferredTime: {
    type: String,
    enum: [
      '00:00 am to 06:00 am',
      '06:00 am to 12:00 pm',
      '12:00 pm to 06:00 pm',
      '06:00 pm to 00:00 am'
    ],
    default: null
  },
  departurePreferredTime: {
    type: String,
    enum: [
      '00:00 am to 06:00 am',
      '06:00 am to 12:00 pm',
      '12:00 pm to 06:00 pm',
      '06:00 pm to 00:00 am'
    ],
    default: null
  }
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
