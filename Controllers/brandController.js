const Joi = require('joi');
const mongoose = require('mongoose');
const BrandModel = require('../models/BrandModel');

const Brand = new BrandModel();

const addBrand = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const joiSchema = Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
      description: Joi.string().required().messages({
        'string.empty': 'Description is required',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) return res.status(400).json(error.details);

    Brand.collection
      .insertOne({
        name: value.name,
        description: value.description,
        user_id: userId,
      })
      .then(() => {
        res
          .status(200)
          .json({ success: true, message: 'Brand added successfully' });
      })
      .catch((err) => {
        res
          .status(400)
          .json({ success: false, message: 'Unable to create product' });
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    Brand.collection
      .find()
      .toArray()
      .then((brands) => {
        res.status(200).json(brands);
      })
      .catch((err) => {
        res
          .status(400)
          .json({ success: false, message: 'Unable to get brands' });
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const editBrand = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden Access' });
    }

    const joiSchema = Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
      description: Joi.string().required().messages({
        'string.empty': 'Description is required',
      }),
      brandId: Joi.string().required().messages({
        'string.empty': 'Brand ID is required',
      }),
    });

    // Validate the request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    const { name, description, brandId } = value;

    const result = await Brand.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(brandId) }, // Filter by ID
      { $set: { name, description } }, // Update name and description
    );

    // Check if the brand was updated
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Brand not found' });
    }

    // Return success message
    return res
      .status(200)
      .json({ success: true, message: 'Brand updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden Access' });
    }

    const joiSchema = Joi.object({
      brandId: Joi.string().required().messages({
        'string.empty': 'Brand ID is required',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }
    const { brandId } = value;

    // Delete the brand from the collection
    const result = await Brand.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(brandId),
    });

    // If no document was deleted, return a 404 error
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Brand not found' });
    }

    // Success response
    return res
      .status(200)
      .json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addBrand,
  getAllBrands,
  editBrand,
  deleteBrand,
};
