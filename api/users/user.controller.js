'use strict';

const User = require('./user.schema');
const userHelper = require('./user.helper');

const users = {
  /**
   * @description User Registration, will create new user
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  signup: async (req, res, next) => {
    const { email, password, first_name, last_name, role } = req.body;
    const user = new User({
      email,
      hashed_password: await userHelper.hashPassword(password),
      first_name,
      last_name,
      role
    });

    await user.save();

    return res.json({
      ok: true,
      user: userHelper.filterObj(
        user.toObject()
      )
    });
  },
  
  /**
   * @description User Login, to authenticate and generate token
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  login: async (req, res, next) => {
    const user = res.locals.user;
    const otp = userHelper.createOTP();
    const token = userHelper.createJwt(user, otp);

    return res.json({
      ok: true,
      token,
      otp,
      user: userHelper.filterObj(
        user.toObject()
      )
    });
  },

  /**
   * @description Retrieve one user data by ID
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  view: async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    return res.json({
      ok: true,
      user: userHelper.filterObj(
        user.toObject()
      )
    });
  },

  /**
   * @description Update one user by ID
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  update: async (req, res, next) => {
    await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }
    );

    const user = await User.findById(req.params.id)

    return res.json({
      ok: true,
      user: userHelper.filterObj(
        user.toObject()
      )
    })
  },

  /**
   * @description Delete one user by ID
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  delete: async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    return res.json({
      ok: true
    })
  }
};

module.exports = users;
