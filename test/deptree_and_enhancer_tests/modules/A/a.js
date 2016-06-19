'use strict';

var debug = require('debug')('archiejs-tests');

var A = module.exports = function(options, imports){
  var me = this;
  return new Promise((resolve) => {
    this.options = options;
    this.imports = imports;
    setTimeout(resolve, 100);
  })
  .then(() => { return me; })
}

A.prototype.getOptions = function() {
  return this.options;
}

A.prototype.getImports = function() {
  return this.imports;
}

A.prototype.getName = function() {
  debug("A");
  return "A";
}
