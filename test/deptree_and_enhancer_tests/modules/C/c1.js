'use strict';

var A = module.exports = function(options, imports){
  this.options = options;
  this.imports = imports;
}

A.prototype.getOptions = function() {
  return this.options;
}

A.prototype.getImports = function() {
  return this.imports;
}

A.prototype.getName = function() {
  return "C";
}
