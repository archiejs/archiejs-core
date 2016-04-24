'use strict';

var A = module.exports = function setup(options, imports) {
  this.options = options;
  this.imports = imports;
}

A.prototype.getOptions = function() {
  return this.options;
}

A.prototype.getImports = function() {
  return this.imports;
}

A.prototype.call_A_Method = function() {
  return "A";
}
