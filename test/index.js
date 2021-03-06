
var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var facade = require('segmentio-facade');
var mapper = require('../lib/mapper');
var assert = require('assert');
var Identify = facade.Identify;
var Track = facade.Track;
var Drip = require('..');

describe('Drip', function(){
  var settings;
  var payload;
  var test;
  var drip;

  beforeEach(function(){
    settings = {
      account: 8838307,
      token: 'bmrdc6hczyn8yss8o8ta'
    };
    drip = new Drip(settings);
    test = Test(drip, __dirname);
    test.mapper(mapper);
    payload = {};
  });

  it('should have the correct settings', function(){
    test
      .name('Drip')
      .endpoint('https://api.getdrip.com/v2/')
      .ensure('settings.account')
      .ensure('settings.token')
      .ensure('message.email')
      .channels(['server']);
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'identify',
        traits: {
          email: 'jd@example.com'
        }
      };
    });

    it('should be valid when token + account are given', function(){
      test.valid(msg, settings);
    });

    it('should be invalid when token / account are missing', function(){
      test.invalid(msg, { account: 123 });
      test.invalid(msg, { token: 123 });
    });
  });

  describe('mapper', function(){
    describe('identify', function(){
      it('should map basic message', function(){
        test.maps('identify-basic');
      });
    });

    describe('track', function(){
      it('should map basic message', function(){
        test.maps('track-basic');
      });
    });
  });

  describe('.identify()', function(){
    it('should identify user successfully', function(done){
      var msg = helpers.identify({ traits: { email: 'amir@segment.io' } });

      payload.email = msg.email();
      payload.custom_fields = drip.normalize(msg.traits());

      test
        .set(settings)
        .identify(msg)
        .sends({ subscribers: [payload] })
        .end(done);
    });

    it('should identify again', function(done){
      var msg = helpers.identify({ traits: { email: 'amir@segment.io' } });
      drip.identify(msg, done);
    });

    it('should error with BadRequest on wrong creds', function(done){
      test
        .set({ account: 1, token: 'x' })
        .identify(helpers.identify())
        .error('Drip: bad request status=401 msg=Authentication failed, check your credentials', done);
    });
  });


  describe('.track()', function(){
    it('should track successfully', function(done){
      var msg = helpers.track({ properties: { email: 'amir@segment.io' } });
      drip.track(msg, done);
    });
  });
});
