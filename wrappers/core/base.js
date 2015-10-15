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
        var registerClassLogic = plugin.__registerClass || this.__registerClass;
        var moduleCache = {}; // a cache of exported service object

        // resolves a service object if it is not in path
        var resolveModuleFn = function(path){
            if (moduleCache[path])
                return moduleCache[path];
            moduleCache[path] = require(path);
            return moduleCache[path];
        };

        // this function registers the wrappers
        var registerWrappersFn = function(err, _registerObjs){

            if(plugin.wrappers) {
                var subKey;
                var tmpKey;
                var mkObj;

                plugin.provides.forEach(function(key){

                    if ( typeof plugin.wrappers[key] === 'string' ) {  // leaf
                        //console.log(key + ' leaf');

                        var Module = resolveModuleFn(plugin.wrappers[key]);
                        if (registerClassLogic) {
                            // at times we may just want to register the classes (ex. db wrappers)
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
            // no wrappers are provided
            return plugin.setup(plugin, imports, registerWrappersFn);
        }else{
            return registerWrappersFn(null, {});
        }
    };

}).call(BaseWrapper.prototype);

module.exports = BaseWrapper;
