'use strict';

var Sequelize = require('sequelize')
  , sequelize
  , db;

exports.init = function(app) {
  db = app.get('config').db;
  sequelize = new Sequelize(db.database, db.username, db.password, db.options);
  app.set('sequelize', sequelize);
  app.set('db', this.registerAndGetModels(sequelize));
  sequelize.sync();
};

exports.registerAndGetModels = function(sequelize) {
  var User = sequelize.import(__dirname + '/users')
    , Vobble = sequelize.import(__dirname + '/vobbles')
    , Event = sequelize.import(__dirname + '/events');

  // 유저-보블 1:M 관계
  User.hasMany(Vobble);

  return {
    User: User,
    Vobble: Vobble,
    Event: Event
  };
};
