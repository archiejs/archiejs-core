
Function.prototype.extends = function(parentClassOrObject){
    var origProto = this.prototype;
    this.prototype = Object.create(parentClassOrObject);
    for(var key in orig){
        this.prototype[key] = orig[key];
    }
    this.prototype.constructor = this;
    this.prototype.super = parentClassOrObject.prototype;
    return this;
};

module.exports.parseArguments = function(){
    // get all keys in arguments, etc
    var data = {};
    var keys = [];
    for(var key in arguments) {
        data[key] = arguments[key];
        keys.push(key);
    }
    var optionIdx = keys.pop();
    var cbIdx = keys.pop();

    // parse arguments
    var cb;
    var options = arguments[optionIdx];
    if (typeof(options) == 'function') {
        cb = options;
        options = {};
        delete data[optionIdx];
    } else {
        cb = arguments[cbIdx];
        if (typeof(cb) != 'function') {
            cb = function() {}; // does nothing
        }else{
            delete data[cbIdx];
        }
    }

    // return values
    return {
        data: data,
        options: options,
        callback: cb
    };
};
