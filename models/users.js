'use strict';

var crypto = require('crypto');

var encryptPassword = function(password) {
  return crypto.createHmac('sha1', 'Vobble_API').update(password).digest('hex');
};

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'users',

    setterMethods: {
      password: function(password) {
        return this.setDataValue('password', encryptPassword(password));
      }
    },

    instanceMethods: {
      authenticate: function(plainText) {
        return encryptPassword(plainText) === this.password;
      }
    }
  });
};
