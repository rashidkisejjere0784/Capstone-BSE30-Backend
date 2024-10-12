const mongoose = require('mongoose');

const { Schema } = mongoose;

const brandSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: String, required: true },
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
