'use strict'

const passport = require('passport');
const User = require('../users/user.schema');
const userHelper = require('../users/user.helper');
const { Acl } = require('../acl');

module.exports = {
  authGuard: (req, res, next) => {
    passport.authenticate('local', (err, user, msg) => {
      if (err) {
        return res.status(500).json('Internal server error');
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
      res.status(400).json({ message: 'Missing Authorization header' })
    }

    // console.log(`==req.header('Authorization':`, req.header('Authorization').split(' ')[1])

    const decodedToken =  userHelper.decodeToken(req.header('Authorization').split(' ')[1]);

    // console.log('== decodedToken:', decodedToken)
    
    if (!decodedToken.ok) {
      return res.status(decodedPayload.error.code).json(decodedPayload.error.message)
    }

    const user = await User.findById(decodedToken.payload.id);
    res.locals.user = user;

    return next();
  },

  roleGuard: ({
    resource,
    resourceAction,
    onlySelf,
  }) => {
    return (req, res, next) => {
      console.log('== resource:', resource)
      console.log('== resourceAction:', resourceAction)
      const user = res.locals.user;

      if (!user.role) {
        return res.status(403).json('Forbidden');
      }

      const aclRole = Acl[user.role];

      console.log('== user:', user);
      console.log('== aclRole:', aclRole);

      // TODO: Check again
      if (onlySelf && req.params.id === user.id) {
        return next();
      }

      if (!aclRole.includes(resourceAction)) {
        return res.status(403).json('Forbidden')
      }
      
      return next();
    }
  }
}