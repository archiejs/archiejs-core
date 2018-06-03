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

  it('tests creating an app with one type 1 module', async function() {
    var tree = Archie.resolveConfig(deptrees["type1"], basedir);
    assertTree(tree);
    var archie = await Archie.createApp(tree);
    assert.isNotNull(archie.services.A);
  });

  it('tests creating an app with one type 2 module', async function() {
    var tree = Archie.resolveConfig(deptrees["type2"], basedir);
    assertTree(tree);
    var archie = await Archie.createApp(tree);
    assert.isNotNull(archie.services.A);
  });
  
  it('tests creating an app with one type 3 module', async function() {
    var tree = Archie.resolveConfig(deptrees["type3"], basedir);
    assertTree(tree);
    var archie = await Archie.createApp(tree);
    assert.isNotNull(archie.services.A);
  });

});
