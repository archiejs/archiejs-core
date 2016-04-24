'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;

chai.use(require('chai-things'));

var Archie= require('./../../');

var A = module.exports = function setup(options, imports, registerFn) {
  console.log("Setup A");
  console.log(options);
  console.log(imports);
  registerFn(null, {
    "A": this
  });
}

A.prototype.whoAmI = function() {
  return "I am A";
}
