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

  it('successfully resolves dependencies in modules that have', async function() {
    var configPath = resolve( __dirname, "modules/t1_success.json" );
    var tree = Archie.loadConfig(configPath);
    var archie = await Archie.createApp(tree);

    // basic checks
    assert.isNotNull(archie);

    // function services
    assert.equal(archie.services.C_another(), "C_another");

    // object services
    assertService(archie.getService("A"), 0, "A");
    assertService(archie.services.B, 1, "B");
    assertService(archie.services.C, 2, "C");

    assert.equal(archie.services.D, null);
  });

  it('successfully resolves dependencies in modules that dont have package.json', async function() {
    var configPath = resolve( __dirname, "modules/t2_success.json" );
    var tree = Archie.loadConfig(configPath);
    var archie = await Archie.createApp(tree);
    assert.isNotNull(archie);

    // object services
    assertService(archie.services.F, 1, "F");
    assertService(archie.services.G, 0, "G");
  });

  it('fails because of missing dependency', async function() {
    var configPath = resolve( __dirname, "modules/t3_fail.json" );
    var tree = Archie.loadConfig(configPath);
    try {
      await Archie.createApp(tree)
    } catch (err) {
      assert(err != null);
      return;
    }
    throw new Error('should fail');
  });
 
  it('fails because it forgot to register', async function() {
    var configPath = resolve( __dirname, "modules/t4_fail.json" );
    var tree = Archie.loadConfig(configPath);
    try {
      await Archie.createApp(tree)
    } catch (err) {
      assert(err != null);
      assert.equal(err.toString(), "Error: Plugin failed to provide E1 service.");
      return;
    }
    throw new Error('should fail');
  });

});
