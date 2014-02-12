'use strict';

var should = require('should')
  , request = require('supertest');

describe('Routing > ', function() {
  var url = 'http://localhost:3000'
    , testUserId = '1'
    , testToken = '6d48cc80b4a4009471025d48a7043f17';

  describe('POST /users > ', function() {
    it('유저 정보를 올바르게 입력하면 회원가입이 정상적으로 처리된다', function(done) {
      var data = {
        email: 'test@vobble.com',
        username: 'test',
        password: 'testpassword'
      };

      request(url)
        .post('/users')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /tokens > ', function() {
    it('유저 정보를 올바르게 입력하면 로그인에 성공하고 user_id 와 token을 반환한다', function(done) {
      var data = {
        email: 'test@vobble.com',
        password: 'testpassword'
      };

      request(url)
        .post('/tokens')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /users/:user_id/vobbles > ', function() {
    it('보블을 생성한다', function(done) {
      var testFilePath = __dirname + '/test_files'
        , voiceFilePath = testFilePath + '/voice_sample.mp3'
        , imageFilePath = testFilePath + '/image_sample.png';

      request(url)
        .post('/users/' + testUserId + '/vobbles')
        .field('token', testToken)
        .field('latitude', '20.22')
        .field('longitude', '50.5')
        .attach('voice', voiceFilePath)
        .attach('image', imageFilePath)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST http://vobble.herokuapp.com/users/:user_id/vobbles > ', function() {
    it('보블을 생성한다', function(done) {
      var testFilePath = __dirname + '/test_files'
        , voiceFilePath = testFilePath + '/voice_sample.mp3'
        , imageFilePath = testFilePath + '/image_sample.png';

      request('http://vobble.herokuapp.com')
        .post('/users/1/vobbles')
        .field('token', "cce726145325834fde22f9b2b8f153e0")
        .field('latitude', '20.22')
        .field('longitude', '50.5')
        .attach('voice', voiceFilePath)
        .attach('image', imageFilePath)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          console.log(res);
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /vobbles > ', function() {
    it('보블 정보를 반환한다', function(done) {
      var data = {
        latitude: '20.22',
        longitude: '50.5'
      };

      request(url)
        .get('/vobbles')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /vobbles/count > ', function() {
    it('모든 보블의 갯수를 반환한다', function(done) {
      request(url)
        .get('/vobbles/count')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /users/:user_id/vobbles > ', function() {
    it('해당 유저의 보블 중 현재 위치에서 가장 가까운 n개의 보블 정보를 반환한다', function(done) {
      var data = {
        latitude: '20.22',
        longitude: '50.5',
        limit: 6
      };

      request(url)
        .get('/users/' + testUserId + '/vobbles')
        .send(data)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe.only('GET /users/:user_id/vobbles/count > ', function() {
    it('해당 유저의 모든 보블의 갯수를 반환한다', function(done) {
      request(url)
        .get('/users/' + testUserId + '/vobbles/count')
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /files/:filename > ', function() {
    it('파일을 다운로드한다', function(done) {
      var filename = '1043-1tqygra.mp3';

      request(url)
        .get('/files/' + filename)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          done();
        });
    });
  });
});
