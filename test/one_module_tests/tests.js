'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname);

var Archie = require('./../../');

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
    Archie.createApp(tree, function(err, archie) {
      if (err) {
        throw err;
      }
      assert.isNotNull(archie.services.A);
      done();
    });
  });

  it('tests creating an app with one type 2 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type2"], basedir);
    assertTree(tree);
    Archie.createApp(tree, function(err, archie) {
      if (err) {
        throw err;
      }
      assert.isNotNull(archie.services.A);
      done();
    });
  });
  
  it('tests creating an app with one type 3 module', function(done) {
    var tree = Archie.resolveConfig(deptrees["type3"], basedir);
    assertTree(tree);
    Archie.createApp(tree, function(err, archie) {
      if (err) {
        throw err;
      }
      assert.isNotNull(archie.services.A);
      done();
    });
  });

});
