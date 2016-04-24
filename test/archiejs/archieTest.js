'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;

chai.use(require('chai-things'));

var ArchieJs = require('./../../');

describe('Archiejs Dependency Manager Testcases:', function(){

  it('tests type 1 modules - dependencies mentioned in config file', function(done) {
    var configPath = resolve( __dirname, "type_1-modules/deptree.json" );
    var tree = ArchieJs.loadConfig( configPath );
    console.log(tree);
    done();
  });

  it('tests type 2 modules - dependencies mentioned in modules', function(done) {
    var configPath = resolve( __dirname, "type_2-modules/deptree.json" );
    var tree = ArchieJs.loadConfig( configPath );
    console.log(tree);
    done();
  });

  it('test sequence called', function(done) {
    done();
  });


});
