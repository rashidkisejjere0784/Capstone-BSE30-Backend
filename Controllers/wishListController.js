/* eslint-disable camelcase */
const Joi = require('joi');
const mongoose = require('mongoose');
const WishListModel = require('../models/WishListModel');

const WishList = new WishListModel();

const addWishList = async (req, res) => {
  try {
    const userId = req.user.id;

    const joiSchema = Joi.object({
      productId: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) return res.status(400).json(error.details);

    WishList.collection
      .insertOne({
        product_id: value.productId,
        user_id: userId,
      })
      .then(() => {
        res.status(200).json({success: true, message: 'WishList added successfully' });
      })
      .catch((err) => {
        res.status(400).json({success: false, message: 'Unable to create product' });
      });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

const getAllWishLists = async (req, res) => {
  try {
    WishList.collection
      .find()
      .toArray()
      .then((wishList) => {
        res.status(200).json(wishList);
      })
      .catch((err) => {
        res.status(400).json({success: false, message: 'Unable to get WishLists' });
      });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

const editWishList = async (req, res) => {
  try {
    const user_id = req.user.id;

    const joiSchema = Joi.object({
      product_id: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
      wishListId: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
    });

    // Validate the request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    const { product_id, wishListId } = value;

    const result = await WishList.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(wishListId) }, // Filter by ID
      { $set: { user_id, product_id } }, // Update name and description
    );

    // Check if the WishList was updated
    if (result.matchedCount === 0) {
      return res.status(404).json({success: false, message: 'WishList not found' });
    }

    // Return success message
    return res.status(200).json({success: true, message: 'WishList updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({success: false, message: error.message });
  }
};

const deleteWishList = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      wishListId: Joi.string().required().messages({
        'string.empty': 'WishList ID is required',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }
    const { wishListId } = value;

    // Delete the WishList from the collection
    const result = await WishList.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(wishListId),
    });

    // If no document was deleted, return a 404 error
    if (result.deletedCount === 0) {
      return res.status(404).json({success: false, message: 'WishList not found' });
    }

    // Success response
    return res.status(200).json({success: true, message: 'WishList deleted successfully' });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message });
  }
};

module.exports = {
  addWishList,
  getAllWishLists,
  editWishList,
  deleteWishList,
};
