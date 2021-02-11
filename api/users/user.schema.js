'use strict'

const mongoose = require('mongoose');
const { Acl } = require('../acl')

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  first_name: String,
  last_name: String,
  role: {
    type: String,
    enum: [Acl.userRoles.ADMIN, Acl.userRoles.MEMBER],
    required: true
  },
});

module.exports = mongoose.model('User', userSchema);
