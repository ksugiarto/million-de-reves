'use strict';

const { Acl } = require('./acl');
const middleware = require('./middlewares/auth-guard');
const user = require('./users/user.controller');

module.exports = (router) => {
  router.post(
    '/signup',
    user.signup
  );

  router.post(
    '/login',
    middleware.authGuard,
    user.login
  );

  router.get(
    '/user/:id([0-9a-f]{24})?',
    middleware.requiresLogin,
    middleware.roleGuard({
      resource: Acl.resources.USER,
      resourceAction: Acl.permissions.USER_VIEW
    }),
    user.view
  );

  router.put(
    '/user/:id([0-9a-f]{24})?/edit',
    middleware.requiresLogin,
    middleware.roleGuard({
      resource: Acl.resources.USER,
      resourceAction: Acl.permissions.USER_UPDATE
    }),
    user.update
  );
  
  router.delete(
    '/user/:id([0-9a-f]{24})?/delete',
    middleware.requiresLogin,
    middleware.roleGuard({
      resource: Acl.resources.USER,
      resourceAction: Acl.permissions.USER_DELETE
    }),
    user.delete
  );
};
