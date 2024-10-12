const express = require('express');
const BrandController = require('../Controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');

const route = express.Router();

route.post('/brand/add', authMiddleware, BrandController.addBrand);
route.get('/brand/all', BrandController.getAllBrands);
route.post('/brand/edit', authMiddleware, BrandController.editBrand);
route.post('/brand/delete', authMiddleware, BrandController.deleteBrand);

module.exports = route;
