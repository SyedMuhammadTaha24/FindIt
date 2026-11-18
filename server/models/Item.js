const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  reporterPhone: {
    type: String,
    required: true
  },
  showContact: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema);