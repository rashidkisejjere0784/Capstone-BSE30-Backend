const express = require('express');
const WishListController = require('../Controllers/wishListController');
const authMiddleware = require('../middleware/authMiddleware');

const route = express.Router();

route.post('/wishList/add', authMiddleware, WishListController.addWishList);
route.get('/wishList/all', authMiddleware, WishListController.getAllWishLists);
route.post('/wishList/edit', authMiddleware, WishListController.editWishList);
route.post(
  '/wishList/delete',
  authMiddleware,
  WishListController.deleteWishList,
);

module.exports = route;
