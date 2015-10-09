'use strict';
var resolve = require('path').resolve;

var BaseWrapper = require('./base');

var MicroservWrapper = function(){
    BaseWrapper.call(this);
    this.wrapperName = "microservice";
};

MicroservWrapper.extends(BaseWrapper);

// static vars
MicroservWrapper.ERR_MSG1 = "\n\
config.packageRole value should be client | server | default or nothing.";

MicroservWrapper.ERR_MSG2 = "\n\
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
     * 1. Initializes plugin.wrapper, given the packageRole
     * 2. If packageRole is a 'client', it sets plugin.consumes to
     * empty array.
     * 3. If packageRole is a 'server', it sets plugin.provides to
     * empty array (safety feature, we should not call these functions
     * directly).
     * 4. If packageRole is 'disable' or is empty, normal function calls are
     * made and microservices are disabled.
     */

    this.resolveConfig = function(plugin, base){
        if(plugin.packageRole && !(plugin.packageRole === 'client' || plugin.packageRole === 'server'
                || plugin.packageRole === 'default')) {
            throw new Error(MicroservWrapper.ERR_MSG1);
        }

        if(plugin.packageRole === 'default') plugin.packageRole = null;
        plugin.wrappers = {};
        plugin.implementations = {};

        if(!plugin.consumes)
            plugin.consumes = [];

        if(typeof plugin.consumes === 'string')
            plugin.consumes = [ plugin.consumes ];

        if(!plugin.provides){
            plugin.provides = [];
            console.log(MicroservWrapper.ERR_MSG2);
            return;
        }

        if(!base)
            base = __dirname;

        var provides = Object.keys(plugin.provides);
        var modulePath = plugin.packagePath;
        var wrappers = {};
        var implementations = {};
        var provide;
        var tmpPath;
        var tmpObj;

        // parse the wrappers

        for(var serviceName in plugin.provides){
            provide = plugin.provides[serviceName];
            if(typeof provide === 'string'){ // file
                tmpPath = resolve(base, modulePath, provide);
                tmpObj = require(tmpPath);
                wrappers[serviceName] = tmpObj;
                if (plugin.packageRole !== 'client'){
                    implementations[serviceName] = tmpObj;
                }
            } else {
                if(typeof provide !== 'object' || provide.implementations === null || provide.interface === null){
                    console.log("Skipping " + serviceName);
                    console.log("...Please provide the implementation and interface files properly.");
                    continue; // skip
                }
                tmpPath = resolve(base, modulePath, provide.interface);
                wrappers[serviceName] = require(tmpPath);
                
                if (plugin.packageRole !== 'client'){
                    tmpPath = resolve(base, modulePath, provide.implementation);
                    implementations[serviceName] = require(tmpPath);
                }
            }
        }

        if (plugin.packageRole === 'client'){
            plugin.consumes = [];
            plugin.provides = provides;
        }else if(plugin.packageRole === 'server'){
            plugin.provides = [];
        }else{ // default
            plugin.provides = provides;
        }

        plugin.wrappers = wrappers;
        plugin.implementations = implementations;
    };
    
    this.setupPlugin = function(plugin, imports, register){
        if(plugin.packageRole === 'client'){
            this.setupPluginClient(plugin, imports, register);
        } else if (plugin.packageRole === 'server'){
            this.setupPluginServer(plugin, imports, register);
        } else {
            this.super.setupPlugin.call(this, plugin, imports, register);
        }
    };

    this.setupPluginClient = function(plugin, imports, register){
        var me = this;
        Object.keys(plugin.wrappers) // each service
        .forEach(function(serviceName){
            // create an object that wraps each wrapper function
            var WrapperObj = function(){};

            // add functions to wrapper object
            var ServiceObj = plugin.wrappers[serviceName];
            var proto = (ServiceObj.prototype) ? (ServiceObj.prototype) : (ServiceObj); // is an object or instance?
            Object.keys(proto) // wrap exposed functions
            .forEach(function(functionName){
                if(proto[functionName]) { // is not false
                    WrapperObj.prototype[functionName] = me.makePluginWrapper(serviceName, functionName);
                }
            });

            // create an wrapper
            plugin.wrappers[serviceName] = new WrapperObj(plugin, imports);
        });
        register(null, plugin.wrappers);
    };

    this.setupPluginServer = function(plugin, imports, register){
        var me = this;
        Object.keys(plugin.wrappers) // each service
        .forEach(function(serviceName){
            // makeHooks
            var makeHooksFn  = function(theServiceName, theWrapper, theInstance) {
                return function(){
                    var proto = (theWrapper.prototype) ? (theWrapper.prototype) : (theWrapper); // is an object or instance?
                    Object.keys(proto) // wrap exposed functions
                    .forEach(function(functionName){
                        if(proto[functionName]) { // is not false
                            me.makePluginHook(theServiceName, functionName, theInstance);
                        }
                     });
                }
            };
            
            // implementation
            var serviceInstance;
            var ServiceObj = plugin.implementations[serviceName];
            var wrap = plugin.wrappers[serviceName];
            if (ServiceObj.prototype){ // if this is an object
                serviceInstance = new ServiceObj(plugin, imports); // make an instance
            }else{
                serviceInstance = ServiceObj; // is an instance
            }
            plugin.implementations[serviceName] = serviceInstance;
            makeHooksFn(serviceName, wrap, serviceInstance)(); // make hooks
        });

        // microservice server plugin does not provide these functions
        // via provides interface, to avoid various entry points into these
        // functions (keeps things simple).
        register(null, {});
    };
    
    /*
     * Abstract function
     */
    
    this.makePluginWrapper = function(serviceName, functionName){
        throw new Error("override");
    };

    this.makePluginHook = function(serviceName, functionName){
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

    /* Misc functions
     */

    this.parseArguments = function(){
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

}).call(MicroservWrapper.prototype);

module.exports = MicroservWrapper;
