'use strict'

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config')();

module.exports = {
  excludedFieldsForResponse: ['hashed_password'],

  hashPassword: (str) => {
    return new Promise((resolve) => {
      bcrypt.hash(str, 10, (err, hash) => {
        resolve(hash);
      });
    });
  },

  verifyPassword: (password, hashedPassword) => {
    return new Promise((resolve) => {
      bcrypt.compare(password, hashedPassword, (err, result) => {
        resolve(result);
      })
    })
  },

  decodeToken: (token) => {
    let payload; 
    try {
      payload = jwt.verify(token, config.api.secret);
    } catch (error) {
      return { ok: false, error: { code: 401, message: error.message }};
    }

    console.log('== payload:', payload)

    if (payload) {
      return { ok: true, payload }
    }
  }
}
