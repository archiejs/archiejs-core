'use strict';

module.exports = function(options, imports, register){
    register(null, {
        "archieKueMicroserviceFactory": require("./kueWrapper")
    });
};
