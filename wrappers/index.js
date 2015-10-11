var DEBUG = false;

var core = require('./core');
var redis = require('./redisMs');

archieWrapper = {
    "core": core.BaseWrapper,
    "microservice": core.BaseWrapper,
    "database": core.DbWrapper,
    "kue": redis.KueWrapper
};

module.exports.default = core.BaseWrapper;

module.exports.registerWrapper = function(path, name){
    if(!name)
        name = path.wrapperName;

    if(archieWrapper[name]){
        console.log("WARNING! You are overwriting a wrapper that is already registered with Archie module");
        console.log("  Wrapper Name : " + name);
        if(DEBUG) console.trace();
    }

    archieWrapper = require(path);
};

module.exports.getWrapper = function(name){
    return archieWrapper[name];
};
