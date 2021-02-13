'use strict'

const passport = require('passport');

const { Acl } = require('../acl');
const User = require('../users/user.schema');
const userHelper = require('../users/user.helper');

module.exports = {
  authGuard: (req, res, next) => {
    passport.authenticate('local', (err, user, msg) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (!user) {
        return res.status(401).json(msg)
      }

      res.locals.user = user;
      return next();
    })(req, res, next);
  },

  requiresLogin: async (req, res, next) => {
    if (!req.header('Authorization')) {
      return res.status(400).json({
        message: 'Missing Authorization header'
      });
    }

    const decodedToken =  userHelper.decodeToken(req.header('Authorization').split(' ')[1]);

    if (!decodedToken.ok) {
      return res.status(decodedToken.error.code).json(decodedToken.error.message);
    }

    const user = await User.findById(decodedToken.payload.id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    res.locals.user = user;
    return next();
  },

  roleGuard: ({
    resource,
    resourceAction,
  }) => {
    return (req, res, next) => {
      const user = res.locals.user;

      if (!user.role) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get list of permission based of User logged in role
      const aclRole = Acl[user.role];

      // Member only able to view their data
      if (
        user.role !== Acl.userRoles.ADMIN &&
        resourceAction == Acl.permissions.USER_VIEW &&
        req.params.id !== user._id.toString()
      ) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      // User logged in doesn't have enough permission
      if (!aclRole.includes(resourceAction)) {
        return res.status(403).json({ message: 'Forbidden' })
      }
      
      return next();
    }
  }
}