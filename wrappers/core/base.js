'use strict';
var resolve = require('path').resolve;

var BaseWrapper = function(){
    this.wrapperName = "base";
    this.__registerClass = false; // default
};

(function(){

    /* resolveConfig modifies the config structure
     * and resolves various dependencies to code
     * in the config.
     *
     * resolveConfig is called when we are loading the config
     * for a wrapped plugin (in resolveConfig in archie.js).
     */

    this.resolveConfig = function(plugin, base){
        if(!base) {
            throw new Error("base should be provided in arguments (use __dirname)");
        }

        if(!plugin.packagePath) 
            throw new Error('packagePath missing in plugin');

        if(!plugin.consumes)
            plugin.consumes = [];

        if(!plugin.provides)
            plugin.provides = [];

        if(typeof plugin.consumes === 'string')
            plugin.consumes = [ plugin.consumes ];

        if(typeof plugin.provides === 'string')
            plugin.provides = [ plugin.provides ];

        if(Array.isArray(plugin.provides))
            return; // nothing to do

        // provides is a json ( of type, serviceName : file )

        var modulePath = plugin.packagePath;
        var provides = Object.keys(plugin.provides);
        var consumes = plugin.consumes;
        var serviceMap = {};

        for(var serviceName in plugin.provides){
            var servicePath = resolve(base, modulePath, plugin.provides[serviceName]);
            serviceMap[serviceName] = require(servicePath);
            console.log(servicePath);
        }

        plugin.wrappers = serviceMap;
        plugin.provides = provides;
    };

    /* This acts as a generic setup function.
     * Note: for us to come here, user should not have provided any
     * setup function or main file in package.json (of their package).
     *
     * setupPlugin wraps the object or its instance.
     * It is called when we are initializing the
     * app in Archie.createApp.
     *
     * Inputs :-
     *
     * plugin   - config details
     * imports  - imports
     * register - register function
     */

    this.setupPlugin = function(plugin, imports, register){
        var registerClassLogic = this.__registerClass;
        // this function registers the wrappers
        var registerWrappers = function(err, _registerObjs){
            if(plugin.wrappers) {
                if (registerClassLogic){
                    // at times we may just want to register the classes (ex. db wrappers)
                    for(var serviceName in plugin.wrappers){
                        _registerObjs[serviceName] = plugin.wrappers[serviceName];
                    }
                }else{
                    // by default we want to register the instances
                    for(var serviceName in plugin.wrappers){
                        var instance = new plugin.wrappers[serviceName](plugin, imports, register);
                        _registerObjs[serviceName] = instance;
                    }
                }
            }
            return register(null, _registerObjs);
        }

        if(plugin.setup){
            // no wrappers are provided
            return plugin.setup(plugin, imports, registerWrappers);
        }else{
            return registerWrappers(null, {});
        }
    };

}).call(BaseWrapper.prototype);

module.exports = BaseWrapper;
