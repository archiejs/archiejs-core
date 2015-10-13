var core = require('./core');
var redis = require('./redisMs');
var MongoWr = require('./mongoDb'); // mongoose wrapper

var DEBUG = false;

wrapperFactory = {
    "core": function() {
        return new core.BaseWrapper();
    },
    "mongodb": function() {
        return new MongoWr();
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
        console.warn("WARNING! You are overwriting a wrapper that is already registered with Archie module");
        console.warn("  Wrapper Name : " + name);
        if(DEBUG) console.trace();
    }

    wrapperFactory = require(path);
};

module.exports.newWrapper = function(name){
    if(wrapperFactory[name]){
        return wrapperFactory[name]();
    }else{
        console.warn("WARINING! Unable to create " + name + " wrapper - it is not registered.");
    }
};
