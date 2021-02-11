'use strict'

exports.Acl = new (function () {
  this.userRoles = {
    ADMIN: 'admin',
    MEMBER: 'member'
  };

  this.resources = {
    USER: 'user',
  }

  this.permissions = {
    USER_VIEW: 'user_view',
    USER_UPDATE: 'user_update',
    USER_DELETE: 'user_delete',
  };

  this[this.userRoles.MEMBER] = [
    this.permissions.USER_VIEW,
  ];

  this[this.userRoles.ADMIN] = [
    ...this[this.userRoles.MEMBER],
    this.permissions.USER_UPDATE,
    this.permissions.USER_DELETE
  ]
})();
