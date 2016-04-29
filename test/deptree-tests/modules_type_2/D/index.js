'use strict';

var D = module.exports = function setup(options, imports, register) {
  this.options = options;
  this.imports = imports;

  console.log("Inside D :- \n");
  console.log(options);
  console.log(imports);

  register(null, {
    "D": this
  });
}

D.prototype.getOptions = function() {
  return this.options;
}

D.prototype.getImports = function() {
  return this.imports;
}
