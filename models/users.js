'use strict';

var bcrypt = require('bcrypt');

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
      password: function(p) {
        var salt = bcrypt.genSaltSync(10)
          , hash = bcrypt.hashSync(p, salt);
        return this.setDataValue('password', hash);
      }
    },

    instanceMethods: {
      verifyPassword: function(password, done) {
        return bcrypt.compare(password, this.password, function(err, res) {
          return done(err, res);
        });
      }
    }
  });
};
