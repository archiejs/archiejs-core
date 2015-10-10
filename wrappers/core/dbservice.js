'use strict';
var resolve = require('path').resolve;

var BaseWrapper = require('./base');

var DbWrapper = function(){
    BaseWrapper.call(this);
    this.wrapperName = "dbwrapper";
};

DbWrapper.extends(BaseWrapper);

DbWrapper.ERR_MSG1 = "";

(function(){
    
    this.resolveConfig = function(plugin, base){
    };
    
    this.setupPlugin = function(plugin, imports, register){
    };
    
    /*
     * Abstract function
     */
    
    this.openClient = function(cb){
        throw new Error("override");
    };

    this.closeClient = function(cb){
        throw new Error("override");
    };

    this.getClient = function(){
        throw new Error("override");
    };

}).call(DbWrapper.prototype);

module.exports = DbWrapper;

