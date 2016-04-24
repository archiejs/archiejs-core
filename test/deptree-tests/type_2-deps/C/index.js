'use strict';

var C = module.exports = function setup(options, imports, register) {
  this.options = options;
  this.imports = imports;

  console.log(options);
  console.log(imports);

  register(null, {
    "C": this
  });
}

C.prototype.getOptions = function() {
  return this.options;
}

C.prototype.getImports = function() {
  return this.imports;
}

C.prototype.call_C1_Method = function() {
  return "C1";
}

C.prototype.call_C2_Method = function() {
  return "C2";
}
