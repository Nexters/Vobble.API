'use strict';

var Sequelize = require('sequelize')
  , fs = require('fs')
  , sequelize
  , models;

exports.init = function(callback) {
  var db = require('../../config/development.json').db;
  sequelize = new Sequelize(db.database, db.username, db.password, db.options);
  models = require('../../models').registerAndGetModels(sequelize);

  sequelize.sync().success(function() {
    console.log('Initialized database.');
    callback(null);
  }).error(function(err) {
    console.error(err);
    callback(err);
  });
};

exports.clearData = function(callback) {
  sequelize.sync({ force: true }).success(function() {
    console.log('Cleared all database.');
    callback(null);
  }).error(function(err) {
    console.error(err);
    callback(err);
  });
};

exports.getUserValueForTesting = function() {
  return {
    email: 'test@vobble.com',
    password: 'password',
    username: 'test user',
    token: 'test token'
  };
};

exports.loadSeedData = function(callback) {
  var userValue = this.getUserValueForTesting();

  var vobbleValue = {
    latitude: '30',
    longitude: '100',
    voice_uri: 'voice_sample.mp3',
    image_uri: 'image_sample.png'
  };

  this.clearData(function(err) {
    models.User.create(userValue).success(function(user) {
      vobbleValue.user_id = user.values.user_id;
      models.Vobble.create(vobbleValue).success(function() {
        callback(null);
      }).error(function(err) {
        callback(err);
      });
    }).error(function(err) {
      callback(err);
    });
  });
};

exports.getUserValueInDatabase = function(callback) {
  var userEmail = this.getUserValueForTesting().email;
  models.User.find({ where: { email: userEmail } }).success(function(user) {
    callback(null, user.values);
  }).error(function(err) {
    callback(err);
  });
};

exports.getVobbleValueInDatabase = function(userId, callback) {
  models.Vobble.find({ where: { user_id: userId } }).success(function(vobble) {
    callback(null, vobble.values);
  }).error(function(err) {
    callback(err);
  });
};

exports.getVoiceFilePathForTesting = function() {
  return __dirname + '/test_files/voice_sample.mp3';
};

exports.getImageFilePathForTesting = function() {
  return __dirname + '/test_files/image_sample.png';
};
