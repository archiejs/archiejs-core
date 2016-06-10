'use strict';

var A = module.exports = function(options, imports, done){
  this.options = options;
  this.imports = imports;
  done();
}

A.prototype.getOptions = function() {
  return this.options;
}

A.prototype.getImports = function() {
  return this.imports;
}

A.prototype.getName = function() {
  return "B";
}
