
Function.prototype.extends = function(parentClassOrObject){
    var origProto = this.prototype;
    this.prototype = Object.create(parentClassOrObject);
    for(var key in origProto){
        this.prototype[key] = origProto[key];
    }
    this.prototype.constructor = this;
    this.prototype.super = parentClassOrObject.prototype;
    return this;
};

