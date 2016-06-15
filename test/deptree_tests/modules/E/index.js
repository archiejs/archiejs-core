'use strict';

module.exports = function setup(options, imports) {
  // forget to provide E1, that nobody is consuming
  return {
//    E1: function() {},
    E2: function() {}
  };
}
