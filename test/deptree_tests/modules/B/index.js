'use strict';

module.exports = function setup(options, imports) {
  //console.log("Inside B :- \n");
  return Promise.resolve({
    "B": new B(options, imports)
  });
}

var B = function(options, imports) {
  this.options = options;
  this.imports = imports;
}

B.prototype.getOptions = function() {
  return this.options;
}

B.prototype.getImports = function() {
  return this.imports;
}

B.prototype.getName = function() {
  return "B";
}
