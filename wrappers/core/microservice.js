'use strict';
var resolve = require('path').resolve;

var BaseWrapper = require('./base');

var MicroservWrapper = function(){
    BaseWrapper.call(this);
    this.wrapperName = "microservice";
};

MicroservWrapper.extends(BaseWrapper);

// static vars
MicroservWrapper.ERR_MSG = "\n\
  WARNING! `provides` structure is empty or incorrect. \n\
  In case of a microservice, `provides` should have structure as below:- \n\n\
  provides: { \n\
    ObjA: { \n\
      implementaton: 'fileImpl.js', \n\
      interface: 'inter.js' \n\
    }, \n\
    ObjB: 'impl_and_interface.js', \n\
    ... \n\
  }\n";

// public members
(function(){

    /* resolveConfig function does following :-
     *
     * 1. Initializes plugin.interface, given the packageRole
     * 2. If packageRole is a 'client', it sets plugin.consumes to
     * empty array.
     * 3. If packageRole is a 'server', it sets plugin.provides to
     * empty array (safety feature, we should not call these functions
     * directly).
     * 4. If packageRole is 'disable' or is empty, normal function calls are
     * made and microservices are disabled.
     */

    this.resolveConfig = function(plugin, base){
        if(!plugin.consumes)
            plugin.consumes = [];

        if(typeof plugin.consumes === 'string')
            plugin.consumes = [ plugin.consumes ];

        if(!plugin.provides){
            plugin.provides = [];
            plugin.interfaces = {};
            console.log(MicroservWrapper.ERR_MSG);
            return;
        }

        if(!base)
            base = __dirname;

        var provides = Object.keys(plugin.provides);
        var modulePath = plugin.packagePath;
        var interfaces = {};

        // parse the interfaces

        for(var serviceName in plugin.provides){
            var serviceFile = plugin.provides[serviceName];
            if(typeof serviceFile === 'object'){ // object
                if(serviceFile.implementation === null && serviceFile.interface === null){
                    console.log("Skipping " + serviceName);
                    console.log("Please provide the implementation and interface files properly.");
                    continue; // skip
                }
                if (plugin.packageRole === 'server'){
                    serviceFile = serviceFile.implementation;
                }else if (plugin.packageRole === 'client'){
                    serviceFile = serviceFile.interface;
                }else if (plugin.packageRole === 'disable' || !plugin.packageRole){ // default
                    serviceFile = serviceFile.implementation;
                }else{
                    var msg = "incorrect packageRole (with value '" + plugin.packageRole + "') found in config.";
                    throw new Error(msg);
                }
            }

            var servicePath = resolve(base, modulePath, serviceFile);
            interfaces[serviceName] = require(servicePath);
        }

        if (plugin.packageRole === 'client'){
            plugin.consumes = [];
            plugin.provides = provides;
        }else if(plugin.packageRole === 'server'){
            plugin.provides = [];
        }else{ // default
            plugin.provides = provides;
        }

        plugin.interfaces = interfaces;
    };
    
    this.setupPlugin = function(plugin, imports, register){
        if(plugin.packageRole === 'client'){
            this.setupPluginClient(plugin, imports, regigter);
        } else if (plugin.packageRole === 'server'){
            this.setupPluginServer(plugin, imports, register);
        } else {
            this.super.setupPlugin.call(this, plugin, imports, register);
        }
    };

    /*
     * Abstract function
     */

    this.setupPluginClient = function(plugin, imports, register){
        throw new Error("override");
    };

    this.setupPluginServer = function(plugin, imports, register){
        throw new Error("override");
    };

    this.openClient = function(cb){
        throw new Error("override");
    };

    this.closeClient = function(cb){
        throw new Error("override");
    };

    this.getClient = function(){
        throw new Error("override");
    };

    this.makeWrappers = function(Service){
        throw new Error("override");
    };

    this.makeHooks = function(Service, instance){
        throw new Error("override");
    };

}).call(MicroservWrapper.prototype);

module.exports = MicroservWrapper;
