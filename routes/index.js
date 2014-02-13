'use strict';

var crypto = require('crypto')
  , path = require('path')
  , fs = require('fs')
  , sequelize
  , User
  , Vobble
  , handlers;

exports.init = function(app) {
  sequelize = app.get('sequelize');
  User = app.get('db').User;
  Vobble = app.get('db').Vobble;

  app.get('/', handlers.index);
  app.post('/users', handlers.createUsers);
  app.post('/tokens', handlers.createTokens);
  app.get('/vobbles', handlers.getVobbles);
  app.post('/users/:user_id/vobbles', handlers.createVobbles);
  app.get('/users/:user_id/vobbles', handlers.getUserVobbles);
  app.get('/files/:filename', handlers.downloadFile);
};

function sendError(res, errMsg) {
  res.send(200, {
    result: 0,
    msg: errMsg
  });
}

exports.handlers = handlers = {
  index: function(req, res) {
    res.send(200, '살아있음');
  },

  createUsers: function(req, res) {
    var email = req.body.email
      , username = req.body.username
      , password = req.body.password;

    User.find({ where: { email: email } }).success(function(user) {
      if (user) {
        sendError(res, '이메일이 존재합니다. 해당 이메일로 로그인하시거나 다른 이메일로 가입 해주세요.');
      } else {
        var token = crypto
                      .createHash('md5')
                      .update(email + (new Date()).getTime() + 'vobble')
                      .digest('hex');

        var userData = {
          email: email,
          username: username,
          password: password,
          token: token
        };

        User.create(userData).success(function(user) {
          res.send(200, { result: 1, user_id: user.values.user_id });
        }).error(function(err) {
          console.error(err);
          sendError(res, '서버 오류');
        });
      }
    }).error(function(err) {
      console.error(err);
      sendError(res, '서버 오류');
    });
  },

  createTokens: function(req, res) {
    var email = req.body.email
      , password = req.body.password;

    User.find({ where: { email: email } }).success(function(user) {
      if (user) {
        user.verifyPassword(password, function(err, result) {
          if (!result) {
            sendError(res, '패스워드가 일치하지 않습니다. 다시 확인해 주세요.');
          } else {
            res.send(200, {
              result: 1,
              user_id: user.user_id,
              token: user.token
            });
          }
        });
      } else {
        sendError(res, '정보자 존재하지 않습니다. 회원가입 후 로그인 해주세요.');
      }
    }).error(function(err) {
      console.error(err);
      sendError(res, '서버 오류');
    });
  },

  createVobbles: function(req, res) {
    var userId = req.params.user_id
      , token = req.body.token
      , latitude = req.body.latitude
      , longitude = req.body.longitude
      , voicePath = req.files.voice.path
      , voiceName = voicePath.substring(voicePath.lastIndexOf('/') + 1)
      , imagePath = req.files.image ? req.files.image.path : ''
      , imageName = imagePath ? imagePath.substring(imagePath.lastIndexOf('/') + 1) : '';

    User.find({ where: { token: token } }).success(function(user) {
      if (user) {
        if (userId !== user.user_id + '') {
          console.error('권한 없음');
          sendError(res, '권한이 없습니다.');
          return;
        }

        var data = {
          user_id: userId,
          voice_uri: voiceName,
          image_uri: imageName,
          latitude: latitude,
          longitude: longitude
        };

        Vobble.create(data).success(function(vobble) {
          res.send(200, {
            result: 1,
            vobble_id: vobble.vobble_id
          });
        }).error(function(err) {
          console.error(err);
          sendError(res, '데이터 저장 실패');
        });
      } else {
        console.error('회원 정보 없음');
        sendError(res, '잘못된 토큰입니다. 로그인을 새로 시도해주세요.');
      }
    }).error(function(err) {
      console.error(err);
      sendError(res, '서버 오류');
    });
  },

  getVobbles: function(req, res) {
    var latitude = req.body.latitude
      , longitude = req.body.longitude
      , limit = req.body.limit ? req.body.limit : 6;

    var queryString = 'SELECT *, ' +
                      '( 6371 * acos( cos( radians(' + latitude + ') ) * cos( radians(' + latitude + ') )' +
                      ' * cos( radians('+ longitude +') - radians(' + longitude + ') ) + sin( radians(' + latitude +
                      ') ) * sin( radians(' + latitude + ') ) ) ) ' +
                      'AS distance FROM vobbles ORDER BY distance LIMIT 0, ' + limit;

    sequelize.query(queryString, Vobble).success(function(vobbles) {
      var vobblesValue = vobbles.map(function(vobble) {
        return vobble.values;
      });

      res.send(200, {
        result: 1,
        vobbles: vobblesValue
      });
    }).error(function(err) {
      console.error(err);
      sendError(res, '서버 오류');
    });
  },

  getUserVobbles: function(req, res) {
    var latitude = req.body.latitude
      , longitude = req.body.longitude
      , limit = req.body.limit ? req.body.limit : 6
      , userId = req.params.user_id;

    var queryString = 'SELECT *, ' +
                      '( 6371 * acos( cos( radians(' + latitude + ') ) * cos( radians( latitude ) )' +
                      ' * cos( radians( longitude ) - radians(' + longitude + ') ) + sin( radians(' + latitude +
                      ') ) * sin( radians( latitude ) ) ) ) ' +
                      'AS distance FROM vobbles WHERE user_id = ' + userId + ' ORDER BY distance LIMIT 0, ' + limit;

    sequelize.query(queryString, Vobble).success(function(vobbles) {
      var vobblesValue = vobbles.map(function(vobble) {
        return vobble.values;
      });

      res.send(200, {
        result: 1,
        vobbles: vobblesValue
      });
    }).error(function(err) {
      console.error(err);
      sendError(res, '서버 오류');
    });
  },

  downloadFile: function(req, res) {
    var filename = req.params.filename
      , filepath = path.join(__dirname, '../files', filename);

    res.download(filepath);
  }
};