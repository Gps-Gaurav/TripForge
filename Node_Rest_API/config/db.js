const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travels';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    console.log("Using DB:", mongoose.connection.name);

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
mongoose.connection.on('connected', async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Existing collections:', collections.map(c => c.name));
});

module.exports = connectDB;