const mongoose = require('mongoose');

const { Schema } = mongoose;

const productImageSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  image_path: { type: String, required: true },
});

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
