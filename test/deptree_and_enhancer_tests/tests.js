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

  it('successfully resolves dependencies in modules', async function() {
    var configPath = resolve( __dirname, "modules/t1_success.json" );
    var tree = Archie.loadConfig(configPath);
    var archie = await Archie.createApp(tree)

    // basic checks
    assert.isNotNull(archie);

    // object services
    assertService(archie.getService("A"), 0, "A");
    assertService(archie.services.B, 1, "B");
    assertService(archie.services.C, 2, "C");
    assertService(archie.services.C_another, 2, "C_another");

    assert.equal(archie.services.D, null);
  });

  it('fails to load module with conflict (provides plugin in enhancer format and also a "main" file/setup function via package.json)', async function() {
    var configPath = resolve( __dirname, "modules/t2_fail.json" );
    try {
      var tree = Archie.loadConfig(configPath);
    } catch(err) {
      assert(err.message.includes('Suggestion, rename it to'));
      return
    }
    throw new Error('should fail')
  });

  it('fails to load module with wrong path', async function() {
    var configPath = resolve( __dirname, "modules/t3_fail.json" );
    try {
      var tree = Archie.loadConfig(configPath);
    } catch(err) {
      assert(err.message.includes('Can\'t find \'nopath/D\' relative to '))
      return
    }
    throw new Error('should fail')
  });

});
