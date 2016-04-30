'use strict';

module.exports = function setup(options, imports, register) {
  // forget to provide E1, that nobody is consuming
  register(null, {
//    E1: function() {},
    E2: function() {}
  });
}
