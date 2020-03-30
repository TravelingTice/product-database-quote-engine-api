const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  user: {
    type: String,
    default: ''
  },
  items: {
      type: Array,
      default: []
  },
  timeStamp: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);
