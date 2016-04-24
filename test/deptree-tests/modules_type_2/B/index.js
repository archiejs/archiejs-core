'use strict';

var B = module.exports = function setup(options, imports, register) {
  this.options = options;
  this.imports = imports;

  console.log(options);
  console.log(imports);

  register(null, {
    "B": this
  });
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
