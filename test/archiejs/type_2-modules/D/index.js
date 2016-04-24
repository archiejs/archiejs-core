'use strict';

var D = module.exports = function setup(options, imports) {
  this.options = options;
  this.imports = imports;
}

D.prototype.getOptions = function() {
  return this.options;
}

D.prototype.getImports = function() {
  return this.imports;
}
