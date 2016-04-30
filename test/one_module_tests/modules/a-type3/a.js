'use strict';

var A = module.exports = function setup(options, imports, registerFn) {
  console.log(__dirname);
  registerFn(null, {
    "A": this
  });
}

A.prototype.whoAmI = function() {
  return "I am A";
}
