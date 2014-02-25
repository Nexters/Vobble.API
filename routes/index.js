'use strict';

var crypto = require('crypto')
  , path = require('path')
  , fs = require('fs')
  , validator = require('validator')
  , sequelize
  , User
  , Vobble
  , Event
  , handlers;

exports.init = function(app) {
  sequelize = app.get('sequelize');
  User = app.get('db').User;
  Vobble = app.get('db').Vobble;
  Event = app.get('db').Event;

  /* API */
  app.get('/ping', handlers.ping);
  app.post('/users', handlers.createUsers);
  app.get('/users/:user_id', handlers.getUsers);
  app.post('/tokens', handlers.createTokens);
  app.get('/vobbles', handlers.getVobbles);
  app.get('/vobbles/count', handlers.getVobblesCount);
  app.post('/users/:user_id/vobbles', handlers.createVobbles);
  app.get('/users/:user_id/vobbles', handlers.getUserVobbles);
  app.get('/users/:user_id/vobbles/count', handlers.getUserVobblesCount);
  app.post('/users/:user_id/vobbles/:vobble_id/delete', handlers.deleteVobbles);
  app.get('/files/:filename', handlers.downloadFile);
  /* Web */
  app.get('/',handlers.index);
  app.get('/events', handlers.events);
};

function sendError(res, errMsg) {
  res.send(200, {
    result: 0,
    msg: errMsg
  });
}

function getLogFormat(req) {
  return req.ip + ' - - "' + req.method + ' ' + req.path + '" ';
}

exports.handlers = handlers = {
  index: function(req, res) {
    res.render('index', { title: 'vobble', layout: false });
  },

  ping: function(req, res) {
    res.send(200, 'pong');
  },

  createUsers: function(req, res) {
    var email = req.body.email
      , username = req.body.username
      , password = req.body.password;

    if (!validator.isEmail(email) || validator.isNull(username) || validator.isNull(password)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / email: ' + email);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find({ where: { email: email } }).success(function(user) {
      if (user) {
        logger.error(getLogFormat(req) + '유저 생성 실패 / email: ' + email);
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
          logger.info(getLogFormat(req) + '유저 생성 성공 / user_id: ' + user.values.user_id);
          res.send(200, { result: 1, user_id: user.values.user_id });
        }).error(function(err) {
          logger.error(getLogFormat(req) + '유저 생성 실패 Sequelize 오류 / email: ' + email);
          logger.error(err);
          sendError(res, '서버 오류');
        });
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequelize 오류 / email: ' + email);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  createTokens: function(req, res) {
    var email = req.body.email
      , password = req.body.password;

    if (!validator.isEmail(email) || validator.isNull(password)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / email: ' + email);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find({ where: { email: email } }).success(function(user) {
      if (user) {
        if (user.authenticate(password)) {
          logger.info(getLogFormat(req) + '유저 인증 성공 / user_id: ' + user.user_id);
          res.send(200, {
            result: 1,
            user_id: user.user_id,
            token: user.token
          });
        } else {
          logger.error(getLogFormat(req) + '패스워드 불일치 / user_id: ' + user.user_id);
          sendError(res, '패스워드가 일치하지 않습니다. 다시 확인해 주세요.');
        }
      } else {
        logger.error(getLogFormat(req) + '유저 정보 없음 / email: ' + email);
        sendError(res, '정보자 존재하지 않습니다. 회원가입 후 로그인 해주세요.');
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequelize 오류 / email: ' + email);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  getUsers: function(req, res) {
    var userId = req.params.user_id;

    if (!validator.isNumeric(userId)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / user_id: ' + userId);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find(userId).success(function(user) {
      if (user) {
        logger.info(getLogFormat(req) + '유저 조회 성공 / user_id: ' + userId);
        res.send(200, {
          result: 1,
          user: {
            user_id: user.values.user_id,
            email: user.values.email,
            username: user.values.username
          }
        });
      } else {
        logger.error(getLogFormat(req) + '유저 정보 없음 / user_id: ' + userId);
        sendError(res, '유저 정보가 없습니다.');
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequelize 오류 / user_id: ' + userId);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  createVobbles: function(req, res) {
    var userId = req.params.user_id
      , token = req.body.token
      , latitude = req.body.latitude
      , longitude = req.body.longitude
      , voicePath = req.files.voice ? req.files.voice.path : ''
      , voiceName = voicePath.substring(voicePath.lastIndexOf('/') + 1)
      , imagePath = req.files.image ? req.files.image.path : ''
      , imageName = imagePath ? imagePath.substring(imagePath.lastIndexOf('/') + 1) : '';

    if (validator.isNull(token) || !validator.isFloat(latitude) ||
      !validator.isFloat(longitude) || validator.isNull(voicePath) ||
      validator.isNull(imagePath) || !validator.isNumeric(userId)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / user_id: ' + userId);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find({ where: { token: token } }).success(function(user) {
      if (user) {
        if (userId !== user.user_id + '') {
          logger.error(getLogFormat(req) + '권한 없음 / user_id: ' + userId);
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
          logger.info(getLogFormat(req) + '보블 생성 성공 / user_id: ' + userId);
          res.send(200, {
            result: 1,
            vobble_id: vobble.vobble_id
          });
        }).error(function(err) {
          logger.error(getLogFormat(req) + '보블 생성 실패 Sequelize 오류 / user_id: ' + userId);
          logger.error(err);
          sendError(res, '데이터 저장 실패');
        });
      } else {
        logger.error(getLogFormat(req) + '유저 정보 없음 / user_id: ' + userId);
        sendError(res, '잘못된 토큰입니다. 로그인을 새로 시도해주세요.');
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequelize 오류 / user_id: ' + userId);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  getVobbles: function(req, res) {
    var latitude = req.query.latitude
      , longitude = req.query.longitude
      , limit = req.query.limit ? req.query.limit : 6;

    if (!validator.isFloat(latitude) || !validator.isFloat(longitude) || !validator.isNumeric(limit)) {
      logger.error(getLogFormat(req) + '잘못된 요청');
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    var queryString = 'SELECT *, ' +
                      '( 6371 * acos( cos( radians(' + latitude + ') ) * cos( radians( latitude ) )' +
                      ' * cos( radians( longitude ) - radians(' + longitude + ') )' +
                      ' + sin( radians(' + latitude + ') ) * sin( radians( latitude ) ) ) ) ' +
                      'AS distance FROM vobbles ORDER BY distance LIMIT 0, ' + limit;

    sequelize.query(queryString, Vobble).success(function(vobbles) {
      var vobblesValue = vobbles.map(function(vobble) {
        return vobble.values;
      });
      logger.info(getLogFormat(req) + '보블 조회 성공');
      res.send(200, {
        result: 1,
        vobbles: vobblesValue
      });
    }).error(function(err) {
      logger.error(getLogFormat(req) + '보블 조회 실패 Sequelize 오류');
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  getVobblesCount: function(req, res) {
    Vobble.findAll().success(function(vobbles) {
      logger.info(getLogFormat(req) + '보블 갯수 조회 성공');
      res.send(200, {
        result: 1,
        count: vobbles.length
      });
    }).error(function(err) {
      logger.error(getLogFormat(req) + '보블 갯수 조회 실패 Sequelize 오류');
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  getUserVobbles: function(req, res) {
    var latitude = req.query.latitude
      , longitude = req.query.longitude
      , limit = req.query.limit ? req.query.limit : 6
      , userId = req.params.user_id;

    if (!validator.isFloat(latitude) || !validator.isFloat(longitude) || !validator.isNumeric(limit) || !validator.isNumeric(userId)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / user_id: ' + userId);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    var queryString = 'SELECT *, ' +
                      '( 6371 * acos( cos( radians(' + latitude + ') ) * cos( radians( latitude ) )' +
                      ' * cos( radians( longitude ) - radians(' + longitude + ') )' +
                      ' + sin( radians(' + latitude + ') ) * sin( radians( latitude ) ) ) ) ' +
                      'AS distance FROM vobbles WHERE user_id = ' + userId + ' ORDER BY distance LIMIT 0, ' + limit;

    sequelize.query(queryString, Vobble).success(function(vobbles) {
      var vobblesValue = vobbles.map(function(vobble) {
        return vobble.values;
      });
      logger.info(getLogFormat(req) + '보블 조회 성공 / user_id: ' + userId);
      res.send(200, {
        result: 1,
        vobbles: vobblesValue
      });
    }).error(function(err) {
      logger.error(getLogFormat(req) + '보블 조회 실패 Sequelize 오류 / user_id: ' + userId);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  getUserVobblesCount: function(req, res) {
    var userId = req.params.user_id;

    if (!validator.isNumeric(userId)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / user_id: ' + userId);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find(userId).success(function(user) {
      if (user) {
        Vobble.findAll({ where: { user_id: userId } }).success(function(vobbles) {
          logger.info(getLogFormat(req) + '보블 갯수 조회 성공 / user_id: ' + userId);
          res.send(200, {
            result: 1,
            count: vobbles.length
          });
        }).error(function(err) {
          logger.error(getLogFormat(req) + '보블 갯수 조회 실패 Sequlieze 오류 / user_id: ' + userId);
          logger.error(err);
          sendError(res, '서버 오류');
        });
      } else {
        logger.error(getLogFormat(req) + '유저 정보 없음 / user_id: ' + userId);
        sendError(res, '존재하지 않는 유저입니다.');
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequelize 오류 / user_id: ' + userId);
      sendError(res, '서버 오류');
    });
  },

  deleteVobbles: function(req, res) {
    var token = req.body.token
      , userId = req.params.user_id
      , vobbleId = req.params.vobble_id;

    if (validator.isNull(token) || !validator.isNumeric(userId) || !validator.isNumeric(vobbleId)) {
      logger.error(getLogFormat(req) + '잘못된 요청 / user_id: ' + userId);
      sendError(res, '잘못된 요청입니다.');
      return;
    }

    User.find(userId).success(function(user) {
      if (user) {
        if (user.values.token !== token) {
          logger.error(getLogFormat(req) + '권한 없음 / user_id: ' + userId);
          sendError(res, '권한이 없습니다.');
          return;
        }
        Vobble.find(vobbleId).success(function(vobble) {
          if (vobble) {
            var voiceName = vobble.values.voice_uri
              , imageName = vobble.values.image_uri
              , voiceFilePath = path.join(__dirname, '../files', voiceName)
              , imageFilePath = path.join(__dirname, '../files', imageName);

            vobble.destroy().success(function() {
              fs.unlink(voiceFilePath, function() {
                fs.unlink(imageFilePath, function() {
                  logger.info(getLogFormat(req) + '보블 삭제 성공 / user_id: ' + userId + ', vobble_id: ' + vobbleId);
                  res.send(200, { result: 1 });
                });
              });
            }).error(function(err) {
              logger.error(getLogFormat(req) + '보블 삭제 실패 Sequlize 오류 / user_id: ' + userId + ', vobble_id: ' + vobbleId);
              logger.error(err);
              sendError(res, '서버 오류');
            });
          } else {
            logger.error(getLogFormat(req) + '보블 정보 없음 / user_id: ' + userId + ', vobble_id: ' + vobbleId);
            sendError(res, '해당 보블이 존재하지 않습니다.');
          }
        }).error(function(err) {
          logger.error(getLogFormat(req) + '보블 조회 실패 Sequelize 오류 / user_id: ' + userId);
          logger.error(err);
          sendError(res, '서버 오류');
        });
      } else {
        logger.error(getLogFormat(req) + '유저 정보 없음 / user_id: ' + userId);
        sendError(res, '존재하지 않는 유저의 id입니다.');
      }
    }).error(function(err) {
      logger.error(getLogFormat(req) + '유저 조회 실패 Sequlize 오류 / user_id: ' + userId);
      logger.error(err);
      sendError(res, '서버 오류');
    });
  },

  downloadFile: function(req, res) {
    var filename = req.params.filename
      , filepath = path.join(__dirname, '../files', filename);

    logger.info(getLogFormat(req) + '파일 다운로드 시작 / filename: ' + filename);
    res.download(filepath);
  },

  events: function(req, res) {
    var data = {
      events: []
    };

    Event.findAll({ order: 'id DESC' }).success(function(events) {
      events.map(function(event) {
        var eventValue = {};
        eventValue.title = event.values.title;
        eventValue.content = event.values.content;
        data.events.push(eventValue);
      });
      logger.info(getLogFormat(req) + '이벤트 조회 성공');
      res.render('events', data);
    }).error(function(err) {
      logger.error(getLogFormat(req) + '이벤트 조회 실패 Sequelize 오류');
      logger.error(err);
      sendError(res, '서버 오류');
    });
  }
};