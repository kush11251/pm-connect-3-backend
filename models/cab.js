const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cabSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true, default: uuidv4 },
  driverName: { type: String, required: true },
  driverNumber: { type: String, required: true },
  cabNumber: { type: String, required: true },
  startingPoint: { type: String, required: true },
  middleStoppagePoints: [{ type: String }],
  stoppingPoint: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Cab = mongoose.model('Cab', cabSchema);
module.exports = Cab;
