# Archie

Archie is largely derived from Architech.js (written by c9). Most of this documentation is
also copied as it is from Architect (and mentions of Architect is changed to Archie).

1. Organizing nodejs project into small independent modules, with their
   own node_modules package versioning.
2. Using static dependency checking between modules at time of starting
   the project.
3. Extremely suitable for TDD (and comes with a boilerplate code to
   setup a nodejs webproject).
4. Applying enhancers to modules - which can convert objects into
   dbtables or wrap them using microservices.
5. The modules act like Java packages, where they make limited
   functionality publicaly available.


## Differences with archietect.js

The differences are as follows,

1. Removed AMD support for browser modules.
2. Added new fields to plugins.
3. Added more logs in case of a failure while initializing a plugin.


## Differences with NPM modules

ArchieJS modules are mostly meant for custom application logic - which
you might later want to reuse in similar applications (maybe this makes
sense if you are a services company). It increases code reusablity,
makes it easier to split the application into micro-services and
visualize your webapp as a number of boxes and pipes connecting them
(see provides and consumes below).


## Brief pitch about ArchieJs

This is a simple but powerful structure for Node.js applications. Using ArchieJs,
you set up a simple configuration and tell Archie which plugins you want to load. Each
plugin registers itself with Archie, so other plugins can use its functions. 


## Plugin Interface

```js
// auth.js

/* All plugins must export this public signature.
 * @options is the hash of options the user passes in when creating an instance
 * of the plugin.
 * @imports is a hash of all services this plugin consumes.
 *
 * Returns
 * @returns one or more services provided/exported by the module
 */

module.exports = function setup(options, imports) {

  // "database" was a service this plugin consumes
  var db = imports.database;

  // USEFUL TIP :-
  // can throw an error
  // can return a Promise
  // or can return a value, as below

  return {
    // "auth" is a service this plugin provides
    auth: {
      users: function (callback) {
        db.keys(callback);
      },
      authenticate: function (username, password, callback) {
        db.get(username, function (user) {
          if (!(user && user.password === password)) {
            return callback();
          }
          callback(user);
        });
      }
    }
  };
};
```

Each plugin is a node module complete with a package.json file.  It need not
actually be in npm, it can be a simple folder in the code tree.

```json
{
    "name": "auth",
    "version": "0.0.1",
    "main": "auth.js",
    "private": true,
    "plugin": {
        "consumes": ["database"],
        "provides": ["auth"]
    }
}
```


## Config Format

The `loadConfig` function below can read an architect config file.  This file can be either JSON or JS (or anything that node's require can read). See under test directory (ex, /tests/deptree_xxx ) on different ways of setting up archiejs projects.


## Archie main API

The architect module exposes two functions as it's main API.

### createApp(config, [callback])

This function starts an architect config.  The return value is an `Archie` instance.  The optional callback will listen for both "error" and "ready" on the app object and report on which one happens first.

### loadConfig(configPath)

This is a sync function that loads a config file and parses all the plugins into a proper config object for use with `createApp`.  While this uses sync I/O all steps along the way are memoized and I/O only occurs on the first invocation.  It's safe to call this in an event loop provided a small set of configPaths are used.


## Class: Archie

Inherits from `EventEmitter`.

The `createApp` function returns an instance of `Archie`.

### Event: "service" (name, service)

When a new service is registered, this event is emitted on the app.  Name is the short name for the service, and service is the actual object with functions.

### Event: "plugin" (plugin)

When a plugin registers, this event is emitted.

### Event: "ready" (app)

When all plugins are done, the "ready" event is emitted.  The value is the Archie instance itself.

