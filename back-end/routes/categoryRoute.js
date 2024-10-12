const express = require('express');
const CategoryController = require('../Controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

const route = express.Router();

route.post('/category/add', authMiddleware, CategoryController.addCategory);
route.get('/category/all', CategoryController.getAllCategories);
route.post('/category/edit', authMiddleware, CategoryController.editCategory);
route.post(
  '/category/delete',
  authMiddleware,
  CategoryController.deleteCategory,
);

module.exports = route;
