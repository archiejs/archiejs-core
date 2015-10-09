
Function.prototype.extends = function(parentClassOrObject){
    var tmp = this.prototype;
    this.prototype = new parentClassOrObject;
    for(var key in tmp){
        this.prototype[key] = tmp[key];
    }
    this.prototype.constructor = this;
    this.prototype.super = parentClassOrObject.prototype;
    return this;
};

