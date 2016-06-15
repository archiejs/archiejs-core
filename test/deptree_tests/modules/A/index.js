'use strict';

module.exports = function setup(options, imports) {
  //console.log("Inside A :- \n");
  return {
    "A": new A(options, imports)
  };
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
