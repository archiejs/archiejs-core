'use strict';

module.exports = function setup(options, imports) {
  //console.log("Inside G :- \n");
  return {
    "G": new G(options, imports)
  };
}

var G = function(options, imports){
  this.options = options;
  this.imports = imports;
}

G.prototype.getOptions = function() {
  return this.options;
}

G.prototype.getImports = function() {
  return this.imports;
}

G.prototype.getName = function() {
  return "G";
}
