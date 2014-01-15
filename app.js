'use strict';

var express = require('express')
  , app = express();


/* development 환경 설정 */
if (app.get('env') === 'development') {
  app.set('config', require('./config/development.json'));
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.errorHandler());
}

/* production 환경 설정 */
if (app.get('env') === 'production') {
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
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