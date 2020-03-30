const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  street1: {
    type: String,
    default: ''
  },
  street2: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  postcode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  businessCard: {
    data: Buffer,
    contentType: String
  },
  notes: {
    type: String,
    default: ''
  },
  addedBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
