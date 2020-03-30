const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Collection', CollectionSchema);
