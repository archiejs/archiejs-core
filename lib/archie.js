"use strict";

var events = require('events');
var EventEmitter = events.EventEmitter;

var debug = require('debug')('archiejs-lib');

var exports = {};

// Your enhancers need below classes

// enhancers are ways to reduce boilerplate code in modules
// (see docs)

var Enhancers = exports.Enhancers = require('./enhancers');
var BaseEnhancerClass = exports.BaseEnhancerClass = require('./base_enhancer');
var defaultEnhancerName = "base";

// setup enhancer
(function() {

  function BaseEnhancerFactoryFn() {
      return new BaseEnhancerClass();
  };

  Enhancers.registerEnhancerFactory(defaultEnhancerName, BaseEnhancerFactoryFn);
}());

// This part Setup's your Archie project

// Nothing is async in here

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
    function loadConfig(configPath) {
      var config = require(configPath);
      var base = dirname(configPath);
      return resolveConfig(config, base);
    }

    function resolveConfig(config, base) {
        if(!config) {
          console.trace("resolveConfig is provided with empty/null config.");
          return;
        }

        config.forEach(function (plugin, index) {
            if (!plugin) {
              console.error(config);
              throw new Error("One of your plugins is undefined");
            }

            // Shortcut where string is used for plugin without any options.
            if (typeof plugin === "string") {
                plugin = config[index] = { packagePath: plugin };
            }

            // if the plugin is in a directory inside packagePath
            if (plugin.hasOwnProperty("packagePath")) {

                // go here if we need to load provides/consumes from package.json
                // otherwise: it can also be defined in config file (see testcases type 1)
                var defaults = resolveModule(base, plugin.packagePath);

                // required to update relative packagePath with an absolute path
                if (defaults.hasOwnProperty("packagePath")) {
                  // if we dont delete it, it will not get copied in the next step
                  delete plugin.packagePath;
                }

                // copy new keys
                Object.keys(defaults).forEach(function (key) {
                    if (!plugin.hasOwnProperty(key)) {
                        plugin[key] = defaults[key];
                    } else {
                        console.warn("Key conflict! Both app config (used) and plugins package.json (skipped) have key " + key);
                    }
                });

            }

            // if no setup function is specified, load the main entry point of package as
            // a setup function.
            // otherwise: if the plugin dependency tree is defined in a js file; a setup
            // function can be specified there.
            if(!plugin.hasOwnProperty("setup")) {

                // not all packages have a main entry point
                // in which case require fails.
                try {
                    plugin.setup = require(plugin.packagePath);
                } catch(e){
                    // if there was an error in parsing the js file, throw it
                    // for the user to debug
                    if (e.code != 'MODULE_NOT_FOUND') throw (e);
                }
            }

            // load enhancer functions
            resolveEnhancers(plugin, base);

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
        var metadata = packagePath && packageJson.plugin || {};

       if (packagePath) {
            modulePath = dirname(packagePath);
        } else {
            try {
                modulePath = resolvePackage(base, modulePath);
            } catch(err1) {
                // there is something wrong with the module path
                // throw an error for user to fix
                throw err1;
            }
        }

        // pacakgeJson - may not have a main entry point
        // in which case these functions are not needed.
        var the_module = {};
        if(packageJson.main){
            the_module = require(modulePath);
        }

        // these are special ones
        var provides = metadata.provides || the_module.provides;
        var consumes = metadata.consumes || the_module.consumes;

        metadata.packagePath = modulePath;
        if (provides) metadata.provides = provides;
        if (consumes) metadata.consumes = consumes;

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

    // Load all objects that are provided by the module (they will be consumed by enhancer)
    function resolveEnhancers(plugin, base){
        if(!plugin.packageEnhancer){
            plugin.packageEnhancer = defaultEnhancerName;
        }
        var enhancerInst = Enhancers.newEnhancer(plugin.packageEnhancer);
        if(!enhancerInst){
            var errmsg = "No registered enhancer with the name " + plugin.packageEnhancer;
            throw new Error(errmsg);
        }
        enhancerInst.resolveConfig(plugin, base);
        plugin.packageEnhancer = enhancerInst;
    }
}());

// Create App creates the project and is async

exports.createApp = createApp;

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

    var resolved = {};
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
    app.services = {};

    // defered promise
    var defer = app.loadPlugins(config);

    // handle success or error
    defer.promise
      .then(() => {
        app.emit("ready", app);
      })
      .catch((err) => {
        console.error(err);
        app.emit("error", err);
      });

    // load plugins
    defer.resolve();
}

Archie.prototype = Object.create(EventEmitter.prototype, {constructor:{value:Archie}});

Archie.prototype.destroy = function() {
    var app = this;

    app.destructors.forEach(function(destroy) {
        destroy();
    });

    app.destructors = [];
};


// callback
Archie.prototype.loadPlugins = function(config) {
    var app = this;
    var sortedConfig = checkConfig(config.concat(app.config));

    // prevent double loading of plugins
    var occur = {};
    sortedConfig = sortedConfig.filter((plugin) => {
      var key = plugin.packagePath;
      if(!occur[key]) {
        return occur[key] = true; // add
      } else {
        return false; // dont add
      }
    });

    // run all plugins in a waterfall
    var defer = Promise.defer();
    for(var plugin of sortedConfig) {
      defer.promise = app.registerPlugin(plugin, defer.promise);
    }
    return defer;
};

/**
 * Register a plugin 
 */
Archie.prototype.registerPlugin = function(plugin, sequence) {
  var app = this;

  return sequence
    // 1. get all imports
    .then(() => {
      debug(`prepare ${plugin.packagePath}`);
      var imports = {};
      if (plugin.consumes) {
        for(var name of plugin.consumes) {
          imports[name] = app.services[name];
        }
      }
      return imports;
    })
    // 2. call the enhancer with pluging and imports (in enhancers context)
    .then((imports) => plugin.packageEnhancer.setupPlugin.call(plugin.packageEnhancer, plugin, imports))
    // 3. register the services
    .then((pluginServices) => {
      debug(`register ${plugin.packagePath}`);

      // check if all services are provided
      for(var name of plugin.provides) {
        // register services
        if (!pluginServices.hasOwnProperty(name)) {
          var err = new Error("Plugin failed to provide " + name + " service.");
          throw (err);
        }

        // check for user mistake - forgot module.exports.
        if( emptyServiceWarning(pluginServices[name]) ){
          console.warn("Warning! looks like service '" + name + "' does not exports or module.exports any objects.");
        }

        app.services[name] = pluginServices[name];

        app.emit("service", name, app.services[name]);
      }

      // check if service needs a destroy called at a later time
      if (pluginServices && pluginServices.hasOwnProperty("onDestroy")) {
        app.destructors.push(pluginServices.onDestroy);
      }

      // The destructor for a plugin
      plugin.destroy = function() {
        if (plugin.provides.length) {
          // @todo, make it possible if all consuming plugins are also dead
          var err = new Error("Plugins that provide services cannot be destroyed. " + JSON.stringify(plugin));
          console.error(err);
          return app.emit("error", err);
        }

        if (pluginServices && pluginServices.hasOwnProperty("onDestroy")) {
          app.destructors.splice(app.destructors.indexOf(pluginServices.onDestroy), 1);
          pluginServices.onDestroy();
        }

        // delete from config
        app.config.splice(app.config.indexOf(plugin), 1);
        app.emit("destroyed", plugin);
      };

      app.emit("plugin", plugin);
    });
};

Archie.prototype.getService = function(name) {
    if (!this.services[name]) {
        throw new Error("Service '" + name + "' not found in archie app!");
    }
    return this.services[name];
};

// Returns an event emitter that represents the app.  It can emit events.
// 
// event: ("service" name, service) emitted when a service is ready to be consumed.
// event: ("plugin", plugin) emitted when a plugin registers.
// event: ("ready", app) emitted when all plugins are ready.
// event: ("error", err) emitted when something goes wrong.
//
// app.services - a hash of all the services in this app
// app.config - the plugin config that was passed in.
//
// NOTE: returns an app object immediately and therefore we use a callback here.
// The returned app object can be used to listen to different events.
//
function createApp(config, callback) {
    var app = new Archie(config);

    function errorHandler(err) {
      console.error(err);
      cleanup();
      app.destroy();
      callback && callback(err);
    }

    function ready(app) {
      cleanup();
      callback && callback(null, app);
    }

    function cleanup() {
      app.removeListener("error", errorHandler);
      app.removeListener("ready", ready);
    };

    app.on("error", errorHandler);
    app.on("ready", ready);
    return app;
}

function emptyServiceWarning(obj){
    // service is a function
    if (typeof obj == 'function')
      return false;
    // service object has some exported properties
    for(var prop in obj){
        return false;
    }
    return true;
}

module.exports = exports;
