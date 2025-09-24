const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  accommodationRequired: { type: Boolean, required: true },
  arrivalDate: { type: Date, default: null },
  departureDate: { type: Date, default: null },
  foodPreference: { type: String, enum: ['veg', 'non-veg', 'vegan', 'other', 'none'], default: 'none' }
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
