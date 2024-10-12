const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    }, // Foreign key for Category
    description: { type: String, required: true },
    discount: { type: Number }, // Discount as a percentage
    availability: { type: Boolean, required: true }, // True if the product is available
    quantity: { type: Number, required: true },
    brand_id: { type: Schema.Types.ObjectId, ref: 'Brand', required: true }, // Foreign key for Brand
    product_image: { type: String, required: true }, // Main product image
    colors: [{ type: String, required: true }], // Array of color options
    rating: [{ type: Number, required: true }], // Array of ratings
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  },
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
