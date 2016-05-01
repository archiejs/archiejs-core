'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;

chai.use(require('chai-things'));

var Archie= require('./../../');

function assertService(serv, num_dependencies, name) {
  assert.equal( Object.keys(serv.getImports()).length , num_dependencies );
  assert.equal( serv.getName() , name );
}

describe('Archiejs Dependency Manager Testcases:', function(){

  it('successfully resolves dependencies in modules that have', function(done) {
    var configPath = resolve( __dirname, "modules/t1_success.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      // basic checks
      assert(!err, "got an error : " + err);
      assert.isNotNull(archie);

      // object services
      assertService(archie.getService("A"), 0, "A");
      assertService(archie.services.B, 1, "B");
      assertService(archie.services.C, 2, "C");
      assertService(archie.services.C_another, 2, "C_another");

      assert.equal(archie.services.D, null);

      done();
    });
  });

  it('fails to load module with conflict (provides plugin in enhancer format and also a "main" file/setup function via package.json)', function(done) {
    var configPath = resolve( __dirname, "modules/t2_fail.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      assert(err != null, "we were expecting an error");
      done();
    });
  });

  it('fails to load module with wrong path', function(done) {
    var configPath = resolve( __dirname, "modules/t3_fail.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      console.log(archie);
      assert(err != null, "we were expecting an error");
      done();
    });
  });

});
