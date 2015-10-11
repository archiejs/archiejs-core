var DEBUG = false;

var core = require('./core');
var redis = require('./redisMs');

wrapperFactory = {
    "core": function() {
        return new core.BaseWrapper();
    },
    "microservice": function() {
        return new core.BaseWrapper();
    },
    "database": function() {
        return new core.DbWrapper();
    },
    "kue": function() {
        return new redis.KueWrapper();
    }
};

module.exports.defaultWrapperName = "core";

module.exports.registerWrapperFactory = function(path, name, factory){
    if(!name)
        name = path.wrapperName;

    if(wrapperFactory[name]){
        console.log("WARNING! You are overwriting a wrapper that is already registered with Archie module");
        console.log("  Wrapper Name : " + name);
        if(DEBUG) console.trace();
    }

    wrapperFactory = require(path);
};

module.exports.newWrapper = function(name){
    if(wrapperFactory[name]){
        return wrapperFactory[name]();
    }else{
        console.log("WARINING! Unable to create " + name + " wrapper - it is not registered.");
    }
};
