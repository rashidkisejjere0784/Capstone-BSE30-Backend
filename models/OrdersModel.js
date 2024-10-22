const mongoose = require('mongoose');
const Product = require('./ProductModel');

const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pendng',
  },
});

const orders = mongoose.model('orders', orderSchema);

modeule.exports = orders;
