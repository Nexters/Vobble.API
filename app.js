'use strict';

var express = require('express')
  , app = express()
  , url = require('url');


/* development 환경 설정 */
if (app.get('env') === 'development') {
  app.set('config', require('./config/development.json'));
  app.set('port', process.env.PORT || 3000);
  app.use(express.limit('5mb'));
  app.use(express.bodyParser({uploadDir: __dirname + '/files'}));
  app.use(express.methodOverride());
  app.use(express.logger({ buffer: 5000}));
  app.use(app.router);
  app.use(express.errorHandler());
}

/* test 환경 설정 - heroku */
if (app.get('env') === 'test') {
  var dbUrl = url.parse(process.env.CLEARDB_DATABASE_URL);
  var testConfig = {
    "db": {
      "database": dbUrl.path.substr(1).split('?')[0],
      "username": dbUrl.auth.split(':')[0],
      "password": dbUrl.auth.split(':')[1],
      "options": {
        "host": dbUrl.hostname,
        "port": dbUrl.port,
        "logging": false,
        "sync": { "force": false },
        "define": {
          "charset": "utf8",
          "underscored": true,
          "timestamps": true
        }
      }
    }
  };
  app.set('config', testConfig);
  app.set('port', process.env.PORT || 3000);
  app.use(express.limit('5mb'));
  app.use(express.bodyParser({uploadDir: __dirname + '/files'}));
  app.use(express.methodOverride());
  app.use(express.logger({ buffer: 5000}));
  app.use(app.router);
  app.use(express.errorHandler());
}

/* production 환경 설정 */
if (app.get('env') === 'production') {
  app.set('port', process.env.PORT || 3000);
  app.use(express.limit('5mb'));
  app.use(express.bodyParser({uploadDir: __dirname + '/files'}));
  app.use(express.methodOverride());
  app.use(express.logger({ buffer: 5000}));
  app.use(app.router);
  app.use(express.errorHandler());
}

/* 데이터 모델 설정 */
require('./models').init(app);

/* 라우터 설정 */
require('./routes').init(app);

/* 서버 실행 */
app.listen(app.get('port'), function() {
  console.log('Hello, world!');
});

process.on('uncaughtException', function(err) {
  console.error(err.stack);
});