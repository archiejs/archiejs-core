
Function.prototype.extends = function(parentClassOrObject){
    this.prototype = Object.create(parentClassOrObject.prototype, this.prototype);
    this.prototype.constructor = this;
    this.prototype.super = parentClassOrObject.prototype;
    return this;
};

