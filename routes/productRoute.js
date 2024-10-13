const express = require('express');
const ProductController = require('../Controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require('../utils/fileUpload');

const upload = fileUpload('./uploads/products/');
const route = express.Router();

route.post(
  '/product/add',
  authMiddleware,
  upload.single('file'),
  ProductController.addProduct,
);
route.post(
  '/product/edit',
  authMiddleware,
  upload.single('file'),
  ProductController.editProduct,
);

route.get('/product/all', ProductController.allProducts);
route.post('/product/delete', authMiddleware, ProductController.deleteProduct);

module.exports = route;