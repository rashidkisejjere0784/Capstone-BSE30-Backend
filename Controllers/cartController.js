const Joi = require('joi');
const mongoose = require('mongoose');
const CartModel = require('../models/CartModel');
const ProductModel = require('../models/ProductModel');

const Cart = new CartModel();
const Product = new ProductModel();

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const joiSchema = Joi.object({
      productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
      }),
      quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a positive integer',
        'number.integer': 'Quantity must be a positive integer',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) return res.status(400).json(error.details);

    const { productId, quantity } = value;

    const product = await Product.collection.findOne({
      _id: new mongoose.Types.ObjectId(productId),
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${product.quantity}`,
      });
    }

    const cartItem = await Cart.collection.findOne({
      product_id: new mongoose.Types.ObjectId(productId),
      user_id: new mongoose.Types.ObjectId(userId),
    });

    if (cartItem) {
      // Update the quantity if the product already exists in the cart
      const newQuantity = cartItem.quantity + quantity;

      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add to cart. Total quantity exceeds available stock of ${product.quantiy}`,
        });
      }

      await CartModel.collection.updateOne(
        { _id: cartItem._id },
        { $set: { quantity: newQuantity } },
      );
    } else {
      await CartModel.collection.insertOne({
        product_id: new mongoose.Types.ObjectId(productId),
        quantity,
        user_id: new mongoose.Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Product added to cart successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.collection
      .find({ user_id: new mongoose.Types.ObjectId(userId) })
      .toArray();

    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No products found in the cart' });
    }

    // Step 2: For each cart item, get the product details from ProductModel.collection
    const productsInCart = [];
    for (const cartItem of cartItems) {
      const product = await Product.collection.findOne({
        _id: cartItem.product_id,
      });

      if (product) {
        productsInCart.push({
          product,
          cartItem,
          totalPrice: product.price * cartItem.quantity,
        });
      }
    }

    return res.status(200).json({ success: true, products: productsInCart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const joiSchema = Joi.object({
      productId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { productId } = value;

    const cartItem = await CartModel.collection.findOne({
      product_id: new mongoose.Types.ObjectId(productId),
      user_id: new mongoose.Types.ObjectId(userId),
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found in the cart' });
    }

    await CartModel.collection.deleteOne({ _id: cartItem._id });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkoutCartItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const joiSchema = Joi.object({
      cartId: Joi.string().required(),
    });
    const { error, value } = joiSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { cartId } = value;

    const cartItem = await CartModel.collection.findOne({
      _id: new mongoose.Types.ObjectId(cartId),
      user_id: new mongoose.Types.ObjectId(userId),
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart item not found' });
    }

    const product = await ProductModel.collection.findOne({
      _id: cartItem.product_id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product associated with cart item not found',
      });
    }

    if (product.quantity < cartItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product. Available stock: ${product.quantity}`,
      });
    }

    await ProductModel.collection.updateOne(
      { _id: product._id },
      { $inc: { quantity: -cartItem.quantity } },
    );

    // remove product from cart
    await CartModel.collection.deleteOne({ _id: cartItem._id });

    return res.status(200).json({
      success: true,
      message: 'Checkout successful, product stock updated',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addToCart, getCartItems, deleteCartItem, checkoutCartItem };
