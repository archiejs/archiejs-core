'use strict';

var B = module.exports = function setup(options, imports) {
  this.options = options;
  this.imports = imports;
}

B.prototype.getOptions = function() {
  return this.options;
}

B.prototype.getImports = function() {
  return this.imports;
}

B.prototype.call_B_Method = function() {
  return "B";
}
