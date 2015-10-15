// This is an abstract class.

'use strict';
var BaseWrapper = require('./base');

var DbWrapper = function(){
    this.baseWrapper = new BaseWrapper(); // contains base class
    this.wrapperName = "dbwrapper";
};

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
        this.baseWrapper.resolveConfig(plugin, base);
    };

    this.setupPlugin = function(plugin, imports, register){
        this.baseWrapper.setupPlugin(plugin, imports, register);
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
