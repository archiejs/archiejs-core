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

  it('check for dep resolution success - type 2 modules', function(done) {
    var configPath = resolve( __dirname, "modules_type_2/success.json" );
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

  it('check for dep resolution failure - tests type 2 modules', function(done) {
    var configPath = resolve( __dirname, "modules_type_2/fail_a_is_missing.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      assert.isNotNull(err);
    });
  });


});
