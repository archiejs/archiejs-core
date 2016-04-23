'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname);

var ArchieJs = require('./../../');
var deptree = require('./dep-tree.json');

var tree_s1 = deptree["set-success-1"];
var tree_f1 = deptree["set-fail-1"];

describe('Archiejs Dependency Manager Testcases:', function(){

  it('test dependency tree', function(done) {
    var tree = ArchieJs.resolveConfig(tree_f1, basedir);
    console.log(tree);
    done();
  });

  it('test sequence called', function(done) {
    done();
  });


});
