'use strict';

module.exports = function setup(options, imports) {
  //console.log("Inside F :- \n");
  return {
    "F": new F(options, imports)
  };
}

var F = function(options, imports){
  this.options = options;
  this.imports = imports;
}

F.prototype.getOptions = function() {
  return this.options;
}

F.prototype.getImports = function() {
  return this.imports;
}

F.prototype.getName = function() {
  return "F";
}
