'use strict';

var A = module.exports = function setup(options, imports, register) {
  this.options = options;
  this.imports = imports;

  console.log("Inside A :- \n");
  console.log(options);
  console.log(imports);

  register(null, {
    "A": this
  });
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
