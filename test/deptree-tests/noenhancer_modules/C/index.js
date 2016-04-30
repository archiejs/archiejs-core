'use strict';

module.exports = function setup(options, imports, register) {
  //console.log("Inside C :- \n");
  register(null, {
    "C": new C(options, imports),
    "C_another": 
        function() {
          return "C_another";
        }
  });
}

var C = function(options, imports) {
  this.options = options;
  this.imports = imports;
}

C.prototype.getOptions = function() {
  return this.options;
}

C.prototype.getImports = function() {
  return this.imports;
}

C.prototype.getName = function() {
  return "C";
}
