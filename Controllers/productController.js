// eslint-disable-next-line import/no-extraneous-dependencies
const { BlobServiceClient } = require('@azure/storage-blob');

const Joi = require('joi'); // Import Joi for validation
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/ProductModel');

dotenv.config();

const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.CONTAINER_NAME;

// Establishes a connection with Azure Blob Storage
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net/?${sasToken}`,
);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadImageStreamed(buffer, fileName) {
  const blobClient = containerClient.getBlockBlobClient(fileName);
  console.log(`Uploading ${fileName} to Azure Blob Storage...`);

  await blobClient.uploadData(buffer); // Uploads the buffer directly
  return blobClient.url; // Return the blob URL
}

async function extractMetadata(file) {
  const contentType = file.mimetype;
  const fileType = contentType.split('/')[1];
  const originalName = file.originalname || `image-${Date.now()}.${fileType}`;
  return `${Date.now()}-${originalName}`;
}

const addProduct = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Ensure the product_image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Extract file metadata and upload to Azure
    const fileName = await extractMetadata(req.file);
    const imageUrl = await uploadImageStreamed(req.file.buffer, fileName);

    // Define the Joi validation schema
    const joiSchema = Joi.object({
      name: Joi.string()
        .required()
        .messages({ 'string.empty': 'Name is required' }),
      price: Joi.number().required().messages({
        'number.base': 'Price must be a number',
        'any.required': 'Price is required',
      }),
      categoryId: Joi.string()
        .required()
        .messages({ 'string.empty': 'Category ID is required' }),
      description: Joi.string()
        .required()
        .messages({ 'string.empty': 'Description is required' }),
      discount: Joi.number().default(0),
      availability: Joi.boolean().required(),
      quantity: Joi.number().required(),
      brandId: Joi.string().required(),
      colors: Joi.array().items(Joi.string()).default(['None']),
      rating: Joi.array().items(Joi.number()).default([0]),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    const newProduct = {
      ...value,
      category_id: new mongoose.Types.ObjectId(value.categoryId),
      brand_id: new mongoose.Types.ObjectId(value.brandId),
      product_image: imageUrl, // Use the Azure Blob URL
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = await Product.collection.insertOne(newProduct);
    if (response.acknowledged) {
      return res.status(200).json({
        message: 'Product added successfully',
        productId: response.insertedId,
      });
    }
    return res.status(400).json({ message: 'Error adding new product' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const allProducts = async (req, res) => {
  try {
    Product.collection
      .find()
      .toArray()
      .then((brands) => {
        res.status(200).json(brands);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: 'Unable to get products' });
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only admins can edit products
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Define the Joi validation schema for editing the product
    const joiSchema = Joi.object({
      name: Joi.string().messages({ 'string.empty': 'Name is required' }),
      productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
      }),
      price: Joi.number().messages({
        'number.base': 'Price must be a number',
        'any.required': 'Price is required',
      }),
      categoryId: Joi.string().messages({
        'string.empty': 'Category ID is required',
      }),
      description: Joi.string().messages({
        'string.empty': 'Description is required',
      }),
      discount: Joi.number().default(0).messages({
        'number.base': 'Discount must be a number',
      }),
      availability: Joi.boolean().messages({
        'any.required': 'Availability status is required',
      }),
      quantity: Joi.number().messages({
        'number.base': 'Quantity must be a number',
        'any.required': 'Quantity is required',
      }),
      brandId: Joi.string().messages({
        'string.empty': 'Brand ID is required',
      }),
      colors: Joi.array()
        .items(Joi.string())
        .default(['None']) // Default value for colors
        .messages({
          'array.includesRequiredUnknowns': 'At least one color is required',
        }),

      rating: Joi.array()
        .items(Joi.number())
        .default([0]) // Default value for rating
        .messages({
          'array.includesRequiredUnknowns': 'At least one rating is required',
        }),
    });

    // Validate the incoming request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    // Extract validated fields
    const {
      productId,
      name,
      price,
      categoryId,
      description,
      discount,
      availability,
      quantity,
      brandId,
      colors,
      rating,
    } = value;

    // Check if the product exists
    const existingProduct = await Product.collection.findOne({
      _id: new mongoose.Types.ObjectId(productId),
    });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prepare the update data
    const updatedProduct = {
      name,
      price,
      category_id: new mongoose.Types.ObjectId(categoryId),
      description,
      discount,
      availability,
      quantity,
      brand_id: new mongoose.Types.ObjectId(brandId),
      colors,
      rating,
      updatedAt: new Date(),
    };

    // If a new product image is uploaded, add it to the update
    if (req.file) {
      updatedProduct.product_image = req.file.path;
    }

    updatedProduct.updatedAt = new Date();

    // Update the product using native MongoDB update
    const result = await Product.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: updatedProduct }, // Set the updated fields
    );

    if (result.matchedCount > 0) {
      return res.status(200).json({
        message: 'Product updated successfully',
      });
    }

    return res.status(400).json({ message: 'Error updating product' });
  } catch (error) {
    // Handle any server errors
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only admins can delete products
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const joiSchema = Joi.object({
      productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
      }),
    });

    // Validate the incoming request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    const { productId } = value;

    // Check if the product exists before attempting deletion
    const existingProduct = await Product.collection.findOne({
      _id: new mongoose.Types.ObjectId(productId),
    });
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    // Delete the product from the collection
    const result = await Product.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(productId),
    });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    }

    return res
      .status(400)
      .json({ success: false, message: 'Error deleting product' });
  } catch (error) {
    // Handle any server errors
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addProduct,
  editProduct,
  allProducts,
  deleteProduct,
};
