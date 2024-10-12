const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId, // Assuming it references a Product model
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    user_id: {
      type: Schema.Types.ObjectId, // Assuming it references a User model
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  },
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
