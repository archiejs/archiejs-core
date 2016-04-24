'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;

chai.use(require('chai-things'));

var Archie= require('./../../');

describe('Archiejs Dependency Manager Testcases:', function(){

  /*
  it('tests type 2 modules - fails to resolve dependencies in modules', function(done) {
    var configPath = resolve( __dirname, "modules_type_2/fail.json" );
    var tree = Archie.loadConfig(configPath);
    try {
      Archie.createApp(tree, function(err, archie) {
        throw new Error("was expecting an error");
        done();
      });
    } catch(err) {
      done();
    }
  });
  */
 
  it('tests type 2 modules - fails to resolve dependencies in modules', function(done) {
    var configPath = resolve( __dirname, "modules_type_2/success.json" );
    var tree = Archie.loadConfig(configPath);
    Archie.createApp(tree, function(err, archie) {
      if (err) {
        throw err;
      }
      done();
    });
  });

});
