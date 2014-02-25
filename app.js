'use strict';

var express = require('express')
  , app = express()
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , uploadDir = __dirname + '/files';

/* 로컬 개발 환경 설정 */
if (app.get('env') === 'development') {
  app.set('config', require('./config/development.json'));
}

/* 테스트 서버 환경 설정 */
if (app.get('env') === 'test') {
  // app.set('config', require('./config/test.json'));
}

/* 실 서버 환경 설정 */
if (app.get('env') === 'production') {
  // app.set('config', require('./config/production.json'));
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
app.use(express.logger({ buffer: 5000}));
app.use(app.router);
app.use(express.errorHandler());

fs.exists(uploadDir, function (exist) {
  if (!exist) {
    fs.mkdir(uploadDir);
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