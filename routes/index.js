'use strict';

var crypto = require('crypto')
  , User
  , Vobble;

var voidHandler = function(req, res) {
  res.send(404);
};

exports.init = function(app) {

  User = app.get('db').User;
  Vobble = app.get('db').Vobble;

  /* 회원가입 (유저 생성) */
  app.post('/users', handlers.createUsers);

  /* 로그인 (토큰 생성) */
  app.post('/tokens', handlers.createTokens);

};

var handlers = exports.handlers = {
  createUsers: function(req, res) {
    console.log('handler > createUsers');

    var email = req.body.email
      , username = req.body.username
      , password = req.body.password;

    User.find({ where: { email: email } }).success(function(user) {
      if (user) {
        // TODO: 상태 코드 맞는지 확인
        res.send(400, {
          result: 0,
          msg: '이미 가입된 회원'
        });
      } else {
        var token = crypto
                      .createHash('md5')
                      .update(email + (new Date()).getTime() + 'vobble')
                      .digest('hex');

        var user = {
          email: email,
          username: username,
          password: password,
          token: token
        };

        User.create(user).success(function() {
          res.send(200, {
            result: 1,
            msg: '회원 가입 성공'
          });
        }).error(function(err) {
          res.send(500, {
            result: 0,
            msg: '서버 오류'
          });
        });
      }
    }).error(function(err) {
      res.send(500, {
        result: 0,
        msg: '서버 오류'
      });
    });
  },

  createTokens: function(req, res) {
    console.log('handler > createTokens');

    var email = req.body.email
      , password = req.body.password;

    User.find({ where: { email: email, password: password } }).success(function(user) {
      if (user) {
        res.send(200, {
          result: 1,
          msg: '로그인 성공',
          user_id: user.user_id,
          token: user.token
        });
      } else {
        res.send(400, {
          result: 0,
          msg: '회원 정보 없음',
          user_id: -1,
          token: -1
        });
      }
    }).error(function(err) {
      res.send(500, {
        result: 0,
        msg: '서버 오류',
        user_id: -1,
        token: -1
      });
    });
  }
};