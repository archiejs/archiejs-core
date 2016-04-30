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
    var configPath = resolve( __dirname, "noenhancer_modules/t1_success.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      // basic checks
      assert(!err, "got an error : " + err);
      assert.isNotNull(archie);

      // function services
      assert.equal(archie.services.C_another(), "C_another");

      // object services
      assertService(archie.getService("A"), 0, "A");
      assertService(archie.services.B, 1, "B");
      assertService(archie.services.C, 2, "C");

      assert.equal(archie.services.D, null);

      done();
    });
  });

  it('successfully resolves dependencies in modules that dont have package.json', function(done) {
    var configPath = resolve( __dirname, "noenhancer_modules/t2_success.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      // basic checks
      assert(!err, "got an error : " + err);
      assert.isNotNull(archie);

      // object services
      assertService(archie.services.F, 1, "F");
      assertService(archie.services.G, 0, "G");

      done();
    });
  });

  it('fails because of missing dependency', function(done) {
    var configPath = resolve( __dirname, "noenhancer_modules/t3_fail.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      assert.isNotNull(err);
      done();
    });
  });

  it('fails because it forgot to register', function(done) {
    var configPath = resolve( __dirname, "noenhancer_modules/t4_fail.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      assert.isNotNull(err);
      assert.equal(err.toString(), "Error: Plugin failed to provide E1 service.");
      done();
    });
  });

});
