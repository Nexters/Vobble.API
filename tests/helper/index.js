'use strict';

var Sequelize = require('sequelize')
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
    username: 'test user'
  };
};

exports.loadSeedData = function(callback) {
  var userValue = this.getUserValueForTesting();

  var vobbleValue = {
    latitude: '30',
    longitude: '100',
    voice_uri: 'mockVoice.m4a',
    image_uri: 'mockImage.jpg'
  };

  this.clearData(function(err) {
    models.User.create(userValue).success(function(user) {
      vobbleValue.userId = user.values.user_id;
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

exports.getVoiceFilePathForTesting = function() {
  return __dirname + '/test_files/voice_sample.mp3';
};

exports.getImageFilePathForTesting = function() {
  return __dirname + '/test_files/image_sample.png';
};
