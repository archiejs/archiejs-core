'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;

var A = module.exports = function setup(options, imports, registerFn) {
  console.log("Setup A");
  
  assert.isNull(options);
  assert.isNull(imports);

  registerFn(null, {
    "A": this
  });
}

A.prototype.whoAmI = function() {
  return "I am A";
}
