const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const User = new UserModel();

const SignUp = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),

      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
      }),

      confirm_password: Joi.string().min(8).required().messages({
        'string.min': 'confirm password must be at least 8 characters long',
        'string.empty': 'confirm password is required',
        'any.required': 'confirm password is required',
      }),

      role: Joi.string().valid('user', 'admin').default('user').messages({
        'any.only': 'Role must be one of [user, admin]',
      }),

      confirm_email_token: Joi.string().optional().default('').allow(null, ''),

      reset_token: Joi.string().optional().default('').allow(null, ''),

      profileImg: Joi.string()
        .uri()
        .optional()
        .allow(null, '')
        .default('')
        .messages({
          'string.uri': 'Profile image must be a valid URL',
        }),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    if (value.confirm_password !== value.password) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }

    // Check if the user already exists in the database by email (adjust this according to your DB logic)
    const existingUser = await User.collection.findOne({ email: value.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email is already in use.' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(value.password, 10); // 10 is the salt rounds

    User.collection
      .insertOne({
        name: value.name,
        email: value.email,
        password: hashedPassword,
        role: value.role,
        profileImg: value.profileImg || null,
      })
      .then((response) => {
        if (response.acknowledged) {
          return res.status(200).json({
            success: true,
            message: 'New user created successfully',
            userId: response.insertedId,
          });
        }
        return res.status(400).json({ message: 'Error creating new user' });
      })
      .catch((err) => {
        throw new Error('Failed to sign up user');
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const SignIn = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),

      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
      }),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.collection.findOne({ email: value.email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const validPassword = await bcrypt.compare(
      value.password,
      existingUser.password,
    );
    if (!validPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
        name: existingUser.name,
      },
      'CLIENT_SECRET_KEY',
      { expiresIn: '60m' },
    );

    res.cookie('token', token, { httpOnly: true, secure: false }).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        profileImg: existingUser.profileImg,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('token').json({
    success: true,
    message: 'Logged out successfully!',
  });
};

module.exports = {
  SignUp,
  SignIn,
  logoutUser,
};
