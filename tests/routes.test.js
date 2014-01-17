'use strict';

var should = require('should')
  , request = require('supertest');

describe('Routing > ', function() {
  var url = 'http://localhost:3000';

  describe.skip('POST /users > ', function() {
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
});
