'use strict';

module.exports = function setup(options, imports) {
  console.log("Inside B :- \n");
  register(null, {
    "B": {
      "getOptions": function() { return options; },
      "getImports": function() { return imports; },
      "getName": function() { return "B"; }
    }
  });
}
