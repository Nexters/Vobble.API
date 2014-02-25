Vobble.API
==========

Vobble API Server (node.js)

## [위키](https://github.com/NextersAppFactory/Vobble.API/wiki/_pages)

데이터 모델, Rest API 등의 문서를 위키로 관리하고 있습니다.

## 이 프로젝트에서 사용하는 노드 모듈

### Production
- express
- mysql
- sequelize
- jade
- validator
- wingston
- dateutil

### Development
- mocha
- should
- supertest
- request

## 클론받고 나서 해야할 일

프로젝트의 루트 위치에서
- `npm install` 명령을 실행합니다.
- config 폴더를 생성합니다. 그 안에 development.json 파일을 만들어서 본인의 로컬 개발 환경에 맞게 설정합니다. 샘플 파일은 아래와 같습니다.

```
$ config/development.json

{
  "db": {
    "database": "데이터베이스 이름",
    "username": "아이디",
    "password": "패스워드",
    "options": {
      "host": "localhost",
      "port": "포트번호",
      "logging": false,
      "sync": { "force": false },
      "define": {
        "charset": "utf8",
        "underscored": true,
        "timestamps": true
      }
    }
  }
}

```

## 테스트

테스트를 실행하려면 프로젝트의 루트 위치에서 `mocha tests/` 명령을 실행하면 됩니다.