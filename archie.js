"use strict";

var events = require('events');
var EventEmitter = events.EventEmitter;

var Wrappers = require('./wrappers');

var exports = {};

// Only define Node-style usage using sync I/O if in node.
(function () {
    var dirname = require('path').dirname;
    var resolve = require('path').resolve;
    var existsSync = require('fs').existsSync || require('path').existsSync;
    var realpathSync = require('fs').realpathSync;
    var packagePathCache = {};

    exports.loadConfig = loadConfig;
    exports.resolveConfig = resolveConfig;

    // This is assumed to be used at startup and uses sync I/O as well as can
    // throw exceptions.  It loads and parses a config file.
    function loadConfig(configPath, callback) {
      var config = require(configPath);
      var base = dirname(configPath);

      var ext_config = resolveDefaultWrappers(config, base, callback);
      return resolveConfig(ext_config, base, callback);
    }

    function resolveConfig(config, base) {
        config.forEach(function (plugin, index) {
            // Shortcut where string is used for plugin without any options.
            if (typeof plugin === "string") {
                plugin = config[index] = { packagePath: plugin };
            }

            // The plugin is a package on the disk.  We need to load it.
            if (plugin.hasOwnProperty("packagePath") 
                  && !(plugin.hasOwnProperty("setup") || plugin.hasOwnProperty("provides"))) {
                var defaults = resolveModule(base, plugin.packagePath);
                Object.keys(defaults).forEach(function (key) {
                    if (!plugin.hasOwnProperty(key)) {
                        plugin[key] = defaults[key];
                    }
                });

                // if no, don't load setup function, etc and create hooks
                plugin.packagePath = defaults.packagePath; // now has the file to load
                plugin.provides = defaults.provides;
                plugin.consumes = defaults.consumes;

                // not all packages have a main entry point
                // in which case require fails.
                try{
                    plugin.setup = require(plugin.packagePath);
                } catch(e){}

                resolveWrappedServices(base, plugin);
            }
        });
        return config;
    }

    // Loads a module, getting metadata from either it's package.json or export
    // object.
    function resolveModule(base, modulePath) {
        var packagePath;
        try {
            packagePath = resolvePackage(base, modulePath + "/package.json");
        }
        catch (err) {
            if (err.code !== "ENOENT") throw err;
        }
        var packageJson = packagePath && require(packagePath) || {};
        if (packageJson && !packageJson.plugin){ // user friendly message
            console.warn("WARNING from " + modulePath);
            console.warn("NOTE: plugin:{...} is missing in package.json");
        }

        var metadata = packagePath && packageJson.plugin || {};

       if (packagePath) {
            modulePath = dirname(packagePath);
        } else {
            try {
                modulePath = resolvePackage(base, modulePath);
            } catch(e) {}
        }

        // pacakgeJson - may not have a main entry point
        // in which case these functions are not needed.
        var module = {};
        if(packageJson.main){
            module = require(modulePath);
        }
        metadata.provides = metadata.provides || module.provides || [];
        metadata.consumes = metadata.consumes || module.consumes || [];
        metadata.packagePath = modulePath;
        return metadata;
    }

    // Node style package resolving so that plugins' package.json can be found relative to the config file
    // It's not the full node require system algorithm, but it's the 99% case
    // This throws, make sure to wrap in try..catch
    function resolvePackage(base, packagePath) {
        var originalBase = base;
        if (!(base in packagePathCache)) {
            packagePathCache[base] = {};
        }
        var cache = packagePathCache[base];
        if (packagePath in cache) {
            return cache[packagePath];
        }
        var newPath, newBase;
        
        newPath = resolve(base, packagePath);
        if (existsSync(newPath)) {
            newPath = realpathSync(newPath);
            cache[packagePath] = newPath;
            return newPath;
        }
        else { // if we did not find the package, look for it in node_modules
            while (base) {
                newPath = resolve(base, "node_modules", packagePath);
                if (existsSync(newPath)) {
                    newPath = realpathSync(newPath);
                    cache[packagePath] = newPath;
                    return newPath;
                }
                newBase = resolve(base, '..');
                if (base === newBase) {
                    break;
                }
                base = newBase;
            }
        }
        var err = new Error("Can't find '" + packagePath + "' relative to '" + originalBase + "'");
        err.code = "ENOENT";
        throw err;
    }

    // Load all objects that are provided by the module (they will be consumed by wrapper)
    function resolveWrappedServices(base, plugin){
        if(!plugin.packageWrapper){
            plugin.packageWrapper = Wrappers.defaultWrapperName;
        }
        var wrapperInst = Wrappers.newWrapper(plugin.packageWrapper);
        if(!wrapperInst){
            var errmsg = "No registered wrapper with the name " + plugin.packageWrapper;
            throw new Error(errmsg);
        }
        wrapperInst.resolveConfig(plugin, base);
        plugin.packageWrapper = wrapperInst;
    }
}());

exports.createApp = createApp;
exports.Archie = Archie;

// Check a plugin config list for bad dependencies and throw on error
function checkConfig(config) {

    // Check for the required fields in each plugin.
    config.forEach(function (plugin) {
        if (plugin.checked) { return; }
        // legacy: not all packages have setup functions
        //if (!plugin.hasOwnProperty("setup")) {
        //    throw new Error("Plugin is missing the setup function " + JSON.stringify(plugin));
        //}
        if (!plugin.hasOwnProperty("provides")) {
            throw new Error("Plugin is missing the provides array " + JSON.stringify(plugin));
        }
        if (!plugin.hasOwnProperty("consumes")) {
            throw new Error("Plugin is missing the consumes array " + JSON.stringify(plugin));
        }
    });

    return checkCycles(config);
}

function checkCycles(config) {
    var plugins = [];
    config.forEach(function(pluginConfig, index) {
        plugins.push({
            packagePath: pluginConfig.packagePath,
            provides: pluginConfig.provides.concat(),
            consumes: pluginConfig.consumes.concat(),
            i: index
        });
    });

    var resolved = {
        hub: true
    };
    var changed = true;
    var sorted = [];

    while(plugins.length && changed) {
        changed = false;

        plugins.concat().forEach(function(plugin) {
            var consumes = plugin.consumes.concat();

            var resolvedAll = true;
            for (var i=0; i<consumes.length; i++) {
                var service = consumes[i];
                if (!resolved[service]) {
                    resolvedAll = false;
                } else {
                    plugin.consumes.splice(plugin.consumes.indexOf(service), 1);
                }
            }

            if (!resolvedAll)
                return;

            plugins.splice(plugins.indexOf(plugin), 1);
            plugin.provides.forEach(function(service) {
                resolved[service] = true;
            });
            sorted.push(config[plugin.i]);
            changed = true;
        });
    }

    if (plugins.length) {
        var unresolved = {};
        plugins.forEach(function(plugin) {
            delete plugin.config;
            plugin.consumes.forEach(function(name) {
                if (unresolved[name] == false)
                    return;
                if (!unresolved[name])
                    unresolved[name] = [];
                unresolved[name].push(plugin.packagePath);
            });
            plugin.provides.forEach(function(name) {
                unresolved[name] = false;
            });
        });

        Object.keys(unresolved).forEach(function(name) {
            if (unresolved[name] == false)
                delete unresolved[name];
        });

        console.error("Could not resolve dependencies of these plugins:", plugins);
        console.error("Resolved services:", Object.keys(resolved));
        console.error("Missing services:", unresolved);
        throw new Error("Could not resolve dependencies");
    }

    return sorted;
}

function Archie(config) {
    var app = this;
    app.config = [];
    app.destructors = [];
    app.services = {
        hub: {
            on: function (name, callback) {
                app.on(name, callback);
            }
        }
    };

    // Give createApp some time to subscribe to our "ready" event
    (typeof process === "object" ? process.nextTick : setTimeout)(function() {
        app.loadPlugins(config, function(err) {
            if (err) {
                throw err;
            }
            app.emit("ready", app);
        });
    });
}

Archie.prototype = Object.create(EventEmitter.prototype, {constructor:{value:Archie}});

Archie.prototype.destroy = function() {
    var app = this;

    app.destructors.forEach(function(destroy) {
        destroy();
    });

    app.destructors = [];
};

Archie.prototype.loadPlugins = function(config, callback) {
    var app = this;

    var sortedConfig;
    try {
        sortedConfig = checkConfig(config.concat(app.config));
    }
    catch(ex) {
        return callback(ex);
    }

    // prevent double loading of plugins
    sortedConfig = sortedConfig.filter(function(c) {
        return config.indexOf(c) > -1;
    });

    var p;
    function next(err) {
        if (err) {
            return callback(err);
        }
        if (p && app.config.indexOf(p) === -1) {
            app.config.push(p);
        }

        p = sortedConfig.shift();
        if (!p) {
            return callback();
        }
        app.registerPlugin(p, next);
    }
    next();
};

/**
 * Register a plugin in the service
 */
Archie.prototype.registerPlugin = function(plugin, next) {
    var app = this;
    var services = app.services;

    var imports = {};
    if (plugin.consumes) {
        plugin.consumes.forEach(function (name) {
            imports[name] = services[name];
        });
    }

    try {
        // this should be called from the wrapper
        plugin.packageWrapper.setupPlugin(plugin, imports, register);
    } catch(e) {
        return app.emit("error", e);
    }

    function register(err, provided) {
        if (err) {
            return app.emit("error", err);
        }

        plugin.provides.forEach(function (name) {
            if (!provided.hasOwnProperty(name)) {
                var err = new Error("Plugin failed to provide " + name + " service. " + JSON.stringify(plugin));
                return app.emit("error", err);
            }
            services[name] = provided[name];
           
            // check for user mistake - forgot module.exports.
            if( isEmpty(services[name]) ){
                console.warn("Warning! looks like service '" + name + "' does not exports or module.exports any objects.");
            }

            if (typeof provided[name] != "function")
                provided[name].name = name;

            app.emit("service", name, services[name]);
        });
        if (provided && provided.hasOwnProperty("onDestroy")) {
            app.destructors.push(provided.onDestroy);
        }

        plugin.destroy = function() {
            if (plugin.provides.length) {
                // @todo, make it possible if all consuming plugins are also dead
                var err = new Error("Plugins that provide services cannot be destroyed. " + JSON.stringify(plugin));
                return app.emit("error", err);
            }

            if (provided && provided.hasOwnProperty("onDestroy")) {
                app.destructors.splice(app.destructors.indexOf(provided.onDestroy), 1);
                provided.onDestroy();
            }

            // delete from config
            app.config.splice(app.config.indexOf(plugin), 1);
            app.emit("destroyed", plugin);
        };

        app.emit("plugin", plugin);
        next();
    }
};

Archie.prototype.getService = function(name) {
    if (!this.services[name]) {
        throw new Error("Service '" + name + "' not found in archie app!");
    }
    return this.services[name];
};

// Returns an event emitter that represents the app.  It can emit events.
// event: ("service" name, service) emitted when a service is ready to be consumed.
// event: ("plugin", plugin) emitted when a plugin registers.
// event: ("ready", app) emitted when all plugins are ready.
// event: ("error", err) emitted when something goes wrong.
// app.services - a hash of all the services in this app
// app.config - the plugin config that was passed in.
function createApp(config, callback) {
    var app;
    try {
        app = new Archie(config);
    } catch(err) {
        if (!callback) throw err;
        return callback(err, app);
    }
    if (callback) {
        app.on("error", done);
        app.on("ready", onReady);
    }
    return app;

    function onReady(app) {
        done();
    }

    function done(err) {
        if (err) {
            app.destroy();
        }
        app.removeListener("error", done);
        app.removeListener("ready", onReady);
        callback(err, app);
    }

}

function isEmpty(obj){
    for(var prop in obj){
        return false;
    }
    return true;
}

module.exports = exports;
