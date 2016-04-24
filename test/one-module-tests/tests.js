'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname);

chai.use(require('chai-things'));

var Archie= require('./../../');

var deptrees = require( resolve(basedir, "deptrees.json") );

function assertTree(tree){
  expect(tree.length).to.equal(1);
  var modA = tree[0];
  assert.isNotNull(modA.setup);
  assert.isNotNull(modA.packagePath)
  expect(modA.provides).to.deep.equal(['A']);
  expect(modA.consumes).to.deep.equal([]);
}

describe('Archiejs Dependency Manager Testcases:', function(){

  it('tests creating an app with one type 1 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type1"], basedir);
    assertTree(tree);
    console.log(tree);
    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie);
      assertTree(archie.config);
      console.log(archie.services.A.whoAmI());
      done();
    });
  });

  it('tests creating an app with one type 2 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type2"], basedir);
    console.log(tree);

    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie.services.A.whoAmI());
      done();
    });
  });
  
  it('tests creating an app with one type 3 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type3"], basedir);

    Archie.createApp(tree, function(err, archie) {
      console.log("App is ready");
      console.log(archie.services.A.whoAmI());
      done();
    });
  });

});
