const express = require('express');
const ProductImageController = require('../Controllers/productImageController');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require('../utils/fileUpload');

const upload = fileUpload('./uploads/product_images/');
const route = express.Router();

route.post(
  '/product-images/add',
  authMiddleware,
  upload.single('file'),
  ProductImageController.addProductImage,
);

route.get('/product-images/get', ProductImageController.getProductImages);

route.post(
  '/product-images/delete',
  authMiddleware,
  ProductImageController.deleteProductImage,
);

module.exports = route;
