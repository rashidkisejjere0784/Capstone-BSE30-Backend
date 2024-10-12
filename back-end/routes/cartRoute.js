const express = require('express');
const CartController = require('../Controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const route = express.Router();

route.post('/cart/add', authMiddleware, CartController.addToCart);
route.get('/cart/all', authMiddleware, CartController.getCartItems);
route.post('/cart/delete', authMiddleware, CartController.deleteCartItem);
route.post('/cart/delete', authMiddleware, CartController.deleteCartItem);
route.post('/cart/checkout', authMiddleware, CartController.checkoutCartItem);

module.exports = route;
