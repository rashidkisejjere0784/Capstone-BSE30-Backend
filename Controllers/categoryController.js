const Joi = require('joi');
const mongoose = require('mongoose');
const CategoryModel = require('../models/CategoryModel');

const Category = new CategoryModel();

const addCategory = async (req, res) => {
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

    Category.collection
      .insertOne({
        name: value.name,
        description: value.description,
        user_id: userId,
      })
      .then(() => {
        res
          .status(200)
          .json({ success: true, message: 'Category added successfully' });
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

const getAllCategories = async (req, res) => {
  try {
    Category.collection
      .find()
      .toArray()
      .then((Categorys) => {
        res.status(200).json(Categorys);
      })
      .catch((err) => {
        res.status(400).json({ message: 'Unable to get Categories' });
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editCategory = async (req, res) => {
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
      CategoryId: Joi.string().required().messages({
        'string.empty': 'Category ID is required',
      }),
    });

    // Validate the request body
    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, errors: error.details.map((e) => e.message) });
    }

    const { name, description, CategoryId } = value;

    const result = await Category.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(CategoryId) }, // Filter by ID
      { $set: { name, description } }, // Update name and description
    );

    // Check if the Category was updated
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }

    // Return success message
    return res
      .status(200)
      .json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden Access' });
    }

    const joiSchema = Joi.object({
      CategoryId: Joi.string().required().messages({
        'string.empty': 'Category ID is required',
      }),
    });

    console.log(userRole);

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, errors: error.details.map((e) => e.message) });
    }
    const { CategoryId } = value;

    // Delete the Category from the collection
    const result = await Category.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(CategoryId),
    });

    // If no document was deleted, return a 404 error
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Success response
    return res
      .status(200)
      .json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  editCategory,
  deleteCategory,
};
