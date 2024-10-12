const express = require('express');
const authRouter = require('./authRoute.js');
const productRouter = require('./productRoute.js');
const brandRouter = require('./brandRoute.js');
const categoryRouter = require('./categoryRoute.js');
const productImageRouter = require('./productImageRoute.js');
const cartRouter = require('./cartRoute.js');
const wishListRouter = require('./wishListRoute.js');

const router = express.Router();

router.use(authRouter);
router.use(productRouter);
router.use(brandRouter);
router.use(categoryRouter);
router.use(productImageRouter);
router.use(cartRouter);
router.use(wishListRouter);

module.exports = router;
