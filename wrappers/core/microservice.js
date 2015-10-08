'use strict';

var BaseWrapper = require('./base');

var MicroservWrapper = function(){
    BaseWrapper.call(this);
    this.wrapperName = "microservice";
};

MicroservWrapper.extends(BaseWrapper);

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

    this.resolveConfig = function(base, plugin){
        var modulePath = plugin.packagePath;
        var provides = Object.keys(plugin.provides);
        var interfaces = {};

        // parse the interfaces

        for(var name in plugin.provides){
            var serviceFile = plugin.provides[name];
            if(typeof serviceFile === 'object'){ // object
                if(serviceFile.implementation === null && serviceFile.interface === null){
                    console.log("Skipping " + name);
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

            var servicePath = modulePath + "/" + filename;
            interfaces[serviceName] = require(servicePath);
        }

        if (plugin.packageRole === 'client'){
            plugin.consumes = [];
            plugin.provides = provides;
        }else if(plugin.packageRole === 'server'){
            plugin.provides = [];
        } 

        plugin.interfaces = interfaces;
    };
    
    this.setupPlugin = function(plugin, imports, register){
        if(plugin.packageRole === 'client'){
            this.setupPluginClient(plugin, imports, regigter);
        } else if (plugin.packageRole === 'server'){
            this.setupPluginServer(plugin, imports, register);
        } else {
            BaseWrapper.setupPlugin.call(this, plugin, imports, register);
        }
    };

    /*
     * Abstract function
     */

    this.setupPluginClient(plugin, imports, register){
        throw new Error("override");
    };

    this.setupPluginServer(plugin, imports, register){
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
