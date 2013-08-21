var vows = require('vows'),
    assert = require('assert'),
    APIeasy = require('api-easy');

var scopes = ['When using the Test API', 'the Test Resource'];

var suite = APIeasy.describe('api/test');

scopes.forEach(function (text) {
  suite.discuss(text);
});

suite.use('localhost', 3000)
     .followRedirect(false)
     .post('/', '' , { lon: 20, lat: 30, url:"test", title: "test" })
       .expect(200, { dynamic: true })
     .export(module);