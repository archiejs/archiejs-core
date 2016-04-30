'use strict';

module.exports = function setup(options, imports, register) {
  //console.log("Inside A :- \n");
  register(null, {
    "A": new A(options, imports)
  });
}

var A = function(options, imports){
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
  return "A";
}
