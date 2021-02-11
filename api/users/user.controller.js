'use strict';

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const OTPAuth = require('otpauth');
const moment = require('moment');
const config = require('../config')();

const User = require('./user.schema');
const userHelper = require('./user.helper');

const createJwt = (user, otp) => {
  const payload = {
    id: user._id,
    otp,
    iat: moment().unix(),
    exp: moment().add(7, 'days').unix()
  }

  return jwt.sign(payload, config.api.secret);
}

const createOTP = rnd => {
  return new OTPAuth.TOTP({
    issuer: 'million-de-reves',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: config.api.secret,
  }).generate();
}

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
    })

    await user.save();
    res.json(user);
  },
  
  /**
   * @description User Login, to authenticate and generate token
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  login: async (req, res, next) => {
    const user = res.locals.user;

    const rnd = Math.floor(Math.random() * 2048);
    const otp = createOTP(rnd);
    const token = createJwt(user, otp);

    console.log('== rnd:', rnd)
    console.log('== otp:', otp)
    console.log('== token:', token)

    res.json({
      ok: true,
      token,
      otp,
      user: _.omit(user, userHelper.excludedFieldsForResponse)
    })
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
      res.status(404).json({msg:"User not found"});
    }

    res.json({ 
      ok: true, 
      user: _.omit(user, userHelper.excludedFieldsForResponse) 
    });
  },

  /**
   * @description Update one user by ID
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  update: async (req, res, next) => {
    console.log('== req.params.id:', req.params.id);
    console.log('== req.body:', req.body);

    await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }
    ).exec();

    const user = await User.findById(req.params.id)

    res.json({
      ok: true,
      user
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

    res.json({
      ok: true
    })
  }
};

module.exports = users;
