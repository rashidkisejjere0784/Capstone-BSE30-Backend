const Joi = require('joi'); // Import Joi for validation
const mongoose = require('mongoose');
const fs = require('fs');
const ProductImage = require('../models/ProductImageModel');

const addProductImage = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Ensure the product_image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Define the Joi validation schema for the product fields
    const joiSchema = Joi.object({
      productId: Joi.string()
        .required()
        .messages({ 'string.empty': 'Product ID is required' }),
    });

    // Validate the incoming request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    // Extract validated fields
    const { productId } = value;

    // Create a new product object
    const newProductImage = {
      product_id: new mongoose.Types.ObjectId(productId),
      image_path: req.file.path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the new product Image into the Product Image collection
    await ProductImage.collection
      .insertOne(newProductImage)
      .then((response) => {
        if (response.acknowledged) {
          return res.status(200).json({
            message: 'Product Image added successfully',
            userId: response.insertedId,
          });
        }
        return res
          .status(400)
          .json({ message: 'Error Adding New product Image' });
      })
      .catch((err) => {
        throw new Error('Failed to sign up user');
      });
  } catch (error) {
    // Handle any server errors
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const getProductImages = async (req, res) => {
  try {
    const { productId } = req.query; // Get productId from the GET request query parameters

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid or missing Product ID' });
    }

    // Query the database for all images associated with the provided productId
    const productImages = await ProductImage.collection
      .find({
        product_id: new mongoose.Types.ObjectId(productId),
      })
      .toArray();

    // Check if any images were found
    if (!productImages.length) {
      return res
        .status(404)
        .json({ message: 'No images found for this product' });
    }

    // Return the images in the response
    return res.status(200).json({
      message: 'Product images retrieved successfully',
      images: productImages,
    });
  } catch (error) {
    // Handle any server errors
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only admins can delete product images
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const joiSchema = Joi.object({
      productImageId: Joi.string()
        .required()
        .messages({ 'string.empty': 'Product Image ID is required' }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    const { productImageId } = value;

    // Validate that productId is provided
    if (!mongoose.Types.ObjectId.isValid(productImageId)) {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }

    // Find the product image by productId
    const existingImage = await ProductImage.collection.findOne({
      _id: new mongoose.Types.ObjectId(productImageId),
    });

    if (!existingImage) {
      return res.status(404).json({ message: 'Product image not found' });
    }

    // Delete the image file from the server (if stored locally)
    const imagePath = existingImage.image_path;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete the image file:', err);
      }
    });

    // Delete the product image from the database
    const result = await ProductImage.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(productImageId),
    });

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .json({ message: 'Product image deleted successfully' });
    }

    return res.status(400).json({ message: 'Error deleting product image' });
  } catch (error) {
    // Handle any server errors
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProductImage,
  deleteProductImage,
  getProductImages,
};
