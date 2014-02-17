'use strict';

var should = require('should')
  , request = require('supertest')
  , helper = require('./helper');

describe('Routing > ', function() {
  var url = 'http://localhost:3000';

  before(function(done) {
    helper.init(function(err) {
      done();
    });
  });

  describe('POST /users > ', function() {
    before(function(done) {
      helper.clearData(function(err) {
        done();
      });
    });

    it('유저 정보를 올바르게 입력하면 회원가입이 정상적으로 처리된다', function(done) {
      var data = helper.getUserValueForTesting();

      request(url)
        .post('/users')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('user_id');
          done();
        });
    });

    it('해당 이메일 주소로 이미 가입되어 있다면 가입에 실패한다', function(done) {
      var data = helper.getUserValueForTesting();

      request(url)
        .post('/users')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('msg');
          done();
        });
    });
  });

  describe('POST /tokens > ', function() {
    before(function(done) {
      helper.clearData(function(err) {
        helper.loadSeedData(function(err) {
          done();
        });
      });
    });

    it('유저 정보를 올바르게 입력하면 로그인에 성공하고 user_id 와 token을 반환한다', function(done) {
      var data = {
        email: helper.getUserValueForTesting().email,
        password: helper.getUserValueForTesting().password
      };

      request(url)
        .post('/tokens')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('token');
          res.body.should.have.property('user_id');
          done();
        });
    });
  });

  describe('GET /users/:user_id', function() {
    var userId;

    before(function(done) {
      helper.clearData(function(err) {
        helper.loadSeedData(function(err) {
          helper.getUserValueInDatabase(function(err, userValue) {
            userId = userValue.user_id;
            done();
          });
        });
      });
    });

    it('유저 정보를 얻는다', function(done) {
      request(url)
        .get('/users/' + userId)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('user');
          done();
        });
    });
  });

  describe('POST /users/:user_id/vobbles > ', function() {
    var userId
      , token;

    before(function(done) {
      helper.clearData(function(err) {
        helper.loadSeedData(function(err) {
          helper.getUserValueInDatabase(function(err, userValue) {
            userId = userValue.user_id;
            token = userValue.token;
            done();
          });
        });
      });
    });

    it('보블을 생성한다', function(done) {
      var voiceFilePath = helper.getVoiceFilePathForTesting()
        , imageFilePath = helper.getImageFilePathForTesting();

      request(url)
        .post('/users/' + userId + '/vobbles')
        .field('token', token)
        .field('latitude', '20.22')
        .field('longitude', '50.5')
        .attach('voice', voiceFilePath)
        .attach('image', imageFilePath)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('vobble_id');
          done();
        });
    });
  });

  describe('GET /vobbles > ', function() {
    before(function(done) {
      helper.clearData(function(err) {
        helper.loadSeedData(function(err) {
          done();
        });
      });
    });

    it('보블 정보를 반환한다', function(done) {
      request(url)
        .get('/vobbles?latitude=30&longitude=40')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('vobbles');
          done();
        });
    });
  });

  describe('GET /users/:user_id/vobbles > ', function() {
    var userId;

    before(function(done) {
      helper.clearData(function(err) {
        helper.loadSeedData(function(err) {
          helper.getUserValueInDatabase(function(err, userValue) {
            userId = userValue.user_id;
            done();
          });
        });
      });
    });

    it('해당 유저의 보블 중 현재 위치에서 가장 가까운 n개의 보블 정보를 반환한다', function(done) {
      request(url)
        .get('/users/' + userId + '/vobbles?latitude=30&longitude=40')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('vobbles');
          done();
        });
    });
  });
});
