// This is an abstract class.

'use strict';
var BaseWrapper = require('./base');

var DbWrapper = function(){
    BaseWrapper.call(this.super);
    this.wrapperName = "dbwrapper";
};

DbWrapper.extends(BaseWrapper);

DbWrapper.HELP_MSG = "\n\
  This wrapper employs the following provide structure in package.json file.\n\n\
  provides: { \n\
      DBObjA: 'fileA.js' , \n\
      DBObjB: 'fileB.js' , \n\
      ...    \n\
  }\n";

(function(){
    
    this.resolveConfig = function(plugin, base){
        if(typeof plugin.provides !== 'object' || Array.isArray(plugin.provides)){
            console.log(DbWrapper.HELP_MSG);
            throw new Error("Incorrect dbWrapper provides format");
        }
        this.super.resolveConfig(plugin, base);
    };

    // derives setupPlugin from BaseWrapper class
    
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
