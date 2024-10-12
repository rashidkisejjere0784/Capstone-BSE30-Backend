const mongoose = require('mongoose');

const { Schema } = mongoose;

const wishListSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

const wishList = mongoose.model('wishList', wishListSchema);

module.exports = wishList;
