'use strict';

var A = module.exports = function setup(options, imports) {
  console.log(__dirname);
  return {
    "A": this
  };
}

A.prototype.whoAmI = function() {
  return "I am A";
}
