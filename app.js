'use strict';

require('date-utils');

var express = require('express')
  , winston = require('winston')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , app = express()
  , uploadDir = __dirname + '/files'
  , logDir = __dirname + '/logs';

var winstonStream = {
  write: function(chunk) {
    logger.info(chunk);
  }
};

/* 로컬 개발 환경 설정 */
if (app.get('env') === 'development') {
  global.logger = global.exceptionLogger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true
      })
    ]
  });
  app.set('config', require('./config/development.json'));
}

/* 실 서버 환경 설정 */
if (app.get('env') === 'production') {
  var date = Date.today().toFormat('YYYY-MM-DD');

  global.logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        filename: 'logs/node-(' + date + ').log',
        colorize: true,
        json: false
      })
    ]
  });

  global.exceptionLogger = new winston.Logger({
    transports: [
      new winston.transports.File({
        filename: 'logs/node-(' + date + ').exceptions',
        colorize: true,
        json: false
      })
    ]
  });

  app.set('config', require('./config/production.json'));
}

/* 공통 환경 설정 */
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.limit('5mb'));
app.use(express.bodyParser({uploadDir: uploadDir}));
app.use(express.methodOverride());
app.use(express.logger({ stream: winstonStream }));
app.use(express.responseTime());
app.use(express.errorHandler());
app.use(app.router);

/* 업로드 디렉토리 생성 */
fs.exists(uploadDir, function (exist) {
  if (!exist) {
    fs.mkdir(uploadDir);
  }
});

/* 로그 디렉토리 생성 */
fs.exists(logDir, function (exist) {
  if (!exist) {
    fs.mkdir(logDir);
  }
});

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