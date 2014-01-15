'use strict';

var Sequelize = require('sequelize')
  , sequelize
  , db;

exports.init = function(app) {
  db = app.get('config').db
  sequelize = new Sequelize(db.database, db.username, db.password, db.options);
  app.set('db', this.register(sequelize));
  sequelize.sync();
};

exports.register = function(sequelize) {
  var User = sequelize.import(__dirname + '/users')
    , Vobble = sequelize.import(__dirname + '/vobbles');

  // 유저-음성 1:M 관계
  User.hasMany(Vobble);

  return {
    User: User,
    Vobble: Vobble
  };
};
