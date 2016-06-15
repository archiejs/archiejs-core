'use strict';

module.exports = function setup(options, imports) {
  return {
    "D": new D(options, imports)
  };
}

var D = function(options, imports) {
  this.options = options;
  this.imports = imports;
}

D.prototype.getOptions = function() {
  return this.options;
}

D.prototype.getImports = function() {
  return this.imports;
}

D.prototype.getName = function() {
  return "D";
}
