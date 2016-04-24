'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname);

chai.use(require('chai-things'));

var Archie= require('./../../');

var deptrees = require( resolve(basedir, "deptrees_one.json") );

describe('Archiejs Dependency Manager Testcases:', function(){

  it('tests creating an app with one type 1 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type1"], basedir);
    console.log(tree);

    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie);
      done();
    });
  });

  it('tests creating an app with one type 2 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type2"], basedir);
    console.log(tree);

    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie);
      done();
    });
  });
  
  it('tests creating an app with one type 3 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type3"], basedir);
    console.log(tree);

    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie);
      done();
    });
  });

});
