# ArchieJs introduction

ArchieJs is a way of breaking up large nodejs projects into independent modules
and solves the tight coupling problem. 

Each module can provide for and consume from other modules. A module is similar to java packages, or dependency injection frameworks; and have a lifecycle, ie. they are initialized and terminated (optional). 

Other features are built on top of this modular architecture - such as easily breaking up the projects into different microservies, or having to write lesser boiler plate code, etc.


## Advantages

1. Loose coupling: Organizing nodejs project into small independent modules. The modules act 
   like Java packages, where they make limited functionality publicaly available.
2. Manage lifecycle of modules: Archiejs knows the dependencies between different modules in 
   the project and initializes them in the right sequence. (In the next versions, this can be 
   built on to manage lifecycle events of modules).
3. Better testing: Each module will have its own suite of testcases.
4. Better maintainablity: Each module can have its own versioning of npm modules. One archiejs module
   can use an older version of an npm module, while the newer written once use newer versions.
   (see section on differences with npm modules below)
5. Lesser boilerplate: Applying enhancers to modules and reduce boiler plate code. For example,
   we can can convert objects into db-tables or wrap them using microservices,
   using existing enhancers (see `demo-webapp-mongo-redis-ticket_booking`).


## Project Background

ArchieJs is derived from Architech.js (written by c9). ArchitectJs was difficult to work with
as it did not provide friendly error messages for novice users and also it was complex, because
it is meant for writing isomorphic code. 

The differences between ArchieJs and Archietect are as follows,

1. Removed support for browser execution.
2. Made it more usefriendly by adding more logs and friendlier error messages.
3. Added support for enhancers and new ways to define `provides` and `consumes` tags.
4. Added support for promises during module initialization sequence. 


## ArchieJs modules vs NPM modules

ArchieJS modules are mostly meant for custom application logic - which
you might later want to reuse in similar applications.
It increases code reusablity, makes it easier to split the application 
into micro-services and visualize your webapp as a number of boxes and pipes 
connecting them (see `provides` and `consumes` below).

Each archiejs module has a package.json with a `plugin` field.

```
plugin: {
  provides: XXX,
  consumes: XXX
}
```

See `test` folder or `demo-` apps for more details.


## Plugin Interface

There are different ways to register a plugin/module interface. One of them is listed
below. Others are explained in archiejs `demo-` applications and under the `test` folder.

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

  // Useful Tip :-
  // can throw an error, can return a Promise or
  // can return a value, as below

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


## Archie main API

The Archiejs library exposes two functions as it's main API.

### createApp(configObject, [callback])

This function starts an archie config. The config object is created using `resolveConfig`.

The return value is an `Archie` instance. One can listen for `error` and `ready` events.

The optional callback has two arguments - `error` and `Archie` instance (usual nodejs
back style).

### resolveConfig(configTree)

This is a sync function that creates a config object. It parses all the modules, reading
their package.json's for the `plugin` key and creates the config object, used in `createApp`
above. 


## Class: Archie

Inherits from `EventEmitter`.

The `createApp` function returns an instance of `Archie`.

### Event: "service" (name, service)

When a new service is registered, this event is emitted on the app. 
Name is the short name for the service, and service is the actual object with functions.

### Event: "plugin" (module)

When a module registers, this event is emitted.

### Event: "ready" (app)

When all plugins are done, the "ready" event is emitted.  The value is the Archie instance itself.

### Event: "error" (error)

When a plugin throws an error, the "error" event is emitted.

