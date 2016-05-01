'use strict';
var resolve = require('path').resolve;
var util = require('util');

var BaseEnhancer = function(){
    this.enhancerName = "base";
    this.__registerClass = false; // default
};

let packaging_error_template = "\
Please dont use index.js in module %s \n\
when using a json format for provides. \n\
Suggestion, remane it to a different name as it confuses archie.js \n\
on how to load the module.";

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

        if(plugin.setup) {
          var err_msg = util.format(packaging_error_template, plugin.packagePath);
          throw new Error(err_msg);
        }

        // provides is a json ( of type, serviceName : file )

        var modulePath = plugin.packagePath;
        var provides = [];
        var consumes = plugin.consumes;
        var serviceMap = {};

        // creates a flat json with . (dots) in keys, instead of nestings.

        var resolveFn = function(_servMap, prefix){
            var _servicePath;
            var _serviceName;
            var pathOrObj;

            for(var key in _servMap){
                pathOrObj = _servMap[key];
                _serviceName = prefix + key;
                if(typeof pathOrObj === 'object'){ // nested object
                    resolveFn (pathOrObj, _serviceName + ".");
                    serviceMap[_serviceName] = pathOrObj;
                }else{ // is path
                    _servicePath = resolve(base, modulePath, pathOrObj);
                    _servMap[key] = _servicePath;
                    serviceMap[_serviceName] = _servicePath; // add shortcut to providers list x.y.z
                }
                provides.push(_serviceName);
            }
        };
        resolveFn (plugin.provides, "");

        plugin.enhancers = serviceMap;
        plugin.provides = provides;
    };

    /* This acts as a generic setup function.
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
        var registerClassLogic = plugin.__registerClass || this.__registerClass;
        var moduleCache = {}; // a cache of exported service object

        // resolves a service object if it is not in path
        var resolveModuleFn = function(path){
            if (moduleCache[path])
                return moduleCache[path];
            moduleCache[path] = require(path);
            return moduleCache[path];
        };

        // Registers the services provided by the plugin and enhance them
        // (if an enhancer has been specified).
        var registerEnhancersFn = function(err, _registerObjs){
            if(plugin.enhancers) {
                var subKey;
                var tmpKey;
                var mkObj;

                plugin.provides.forEach(function(key){

                    if ( typeof plugin.enhancers[key] === 'string' ) {  // leaf
                        //console.log(key + ' leaf');

                        var Module = resolveModuleFn(plugin.enhancers[key]);
                        if (registerClassLogic) {
                            // at times we may just want to register the classes (ex. db enhancers)
                            _registerObjs[key] = Module;
                        } else {
                            // by default we want to register the instances
                            _registerObjs[key] = new Module ( plugin, imports, register );
                        }

                    } else {  // non-leaf
                        //console.log(key + ' non-leaf');

                        mkObj = {};
                        plugin.provides.forEach(function(subKey){
                            if ( key === subKey ) { // break when it finds itself
                                return false;
                            }
                            if ( subKey.indexOf(key) === 0 ) { // we found a subKey
                                tmpKey = subKey.slice( key.length + 1 );
                                mkObj[tmpKey] = _registerObjs[subKey]; // add
                            }
                        });
                        _registerObjs[key] = mkObj;

                    }

                });
            }
            return register(null, _registerObjs);
        };

        if(plugin.setup){
            // The provides are in array form and the 'main' file has a setup
            // function that will register all exported services of the module.
            return plugin.setup(plugin, imports, registerEnhancersFn);
        }else{
            // There is no single setup/constructor function.
            // For ex., provides are in Json form mapping service names to
            // implementation files.
            return registerEnhancersFn(null, {});
        }
    };

}).call(BaseEnhancer.prototype);

module.exports = BaseEnhancer;