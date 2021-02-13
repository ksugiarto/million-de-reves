'use strict'

const _ = require('lodash');
const bcrypt = require('bcrypt');
const OTPAuth = require('otpauth');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const config = require('../config')();
const excludedFieldsForResponse = [ 'hashed_password', '__v' ];

module.exports = {
  // To hash password before save to db
  hashPassword: str => {
    return new Promise((resolve) => {
      bcrypt.hash(str, 10, (err, hash) => {
        resolve(hash);
      });
    });
  },

  // To compare the provided password and hashed password from db
  verifyPassword: (password, hashedPassword) => {
    return new Promise((resolve) => {
      bcrypt.compare(password, hashedPassword, (err, result) => {
        resolve(result);
      })
    })
  },

  // Create OTP for part of Token payload
  createOTP: () => {
    return new OTPAuth.TOTP({
      issuer: 'million-de-reves',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: config.api.secret,
    }).generate();
  },

  // Generate Token using JWT
  createJwt: (user, otp) => {
    const payload = {
      id: user._id,
      otp,
      iat: moment().unix(),
      exp: moment().add(7, 'days').unix()
    }
  
    return jwt.sign(payload, config.api.secret);
  },
  
  // Decode Token and return the payload
  decodeToken: token => {
    let payload; 
    try {
      payload = jwt.verify(token, config.api.secret);
    } catch (error) {
      return { ok: false, error: { code: 401, message: error.message }};
    }

    if (!payload) {
      return { ok: false, error: { code: 401, message: 'Unauthorized' }};
    }

    return { ok: true, payload };
  },

  filterObj: obj => {
    return _.omit(obj, excludedFieldsForResponse);
  }
}
