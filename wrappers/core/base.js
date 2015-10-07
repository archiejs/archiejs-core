'use strict';
require('./misc.js');

var BaseWrapper = function(wrapperManager){
    this.registerWrapper(wrapperManager);
};

(function(){

    /* Register the wrapper in wrapper manager
     */

    this.registerWrapper = function(wrapperManager){
        wrapperManager.register(null,
        {
            "base": this
        });
    };

    /* resolveConfig modifies the config structure
     * and resolves various dependencies to code
     * in the config.
     *
     * resolveConfig is called when we are loading the config
     * for a wrapped plugin (in resolveConfig in archie.js).
     */

    this.resolveConfig = function(plugin){
        var modulePath = plugin.packagePath;
        var provides = plugin.provides;

        if(typeof provides === 'array' || typeof provides === 'string'){
            return; // nothing to do
        }

        provides = Object.keys(plugin.provides);
        var interfaces = {};
        for(var name in plugin.provides){
            var servicePath = modulePath + "/" + plugin.provides[name];
            interfaces[serviceName] = require(servicePath);
        }

        plugin.interfaces = interfaces;
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
        var interfaces = plugin.interfaces;
        var setup = plugin.setup;

        if(!interfaces){
            // no interfaces are provided
            return plugin.setup.call(plugin, imports, regsiter);
        }

        try {
            var serviceInstances = {};
            for(var name in interfaces){
                var theServiceInst = new interfaces[name];
                serviceInstances[name] = theServiceInstance;
            }
        }catch(err){
            return register(err);
        }

        return register(null, serviceInstances);
    };

}).call(BaseWrapper.prototype);

module.exports = BaseWrapper;
