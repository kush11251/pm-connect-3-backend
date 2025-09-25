
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const tokenRoutes = require('./routes/token');
const cabRoutes = require('./routes/cab');
const userPreference = require('./routes/userPreference');
const adminTools = require('./routes/devtools');

const fileUpload = require('./routes/fileUpload');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.use('/api/user', userRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/cab', cabRoutes);
app.use('/api/userPreference', userPreference);
app.use('/api/devtools', adminTools);
app.use('/api/fileUpload', fileUpload);

// Start server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
