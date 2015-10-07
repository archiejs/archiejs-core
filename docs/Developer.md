# Architecture Document

## Application Flow

### Initializaton - step 1 - `loadConfig`

In the initialization phase, an array of config json's is passed to the archie.js application. Archie.js, checks is all plugin dependencies are satisfied and loads the plugins and fetches a pointer to the main setup function.

#### Code flow

The code starting in line 9 starts. It is the initializing code for archie.js . It kickstarts when a calling nodejs application, makes a call to `loadConfig` or `resolveConfig`. 

    loadConfig / resolveConfig
      |
      +-> resolveModule
           |
           +-> resolvePackage

1. `resolveConfig` loads each of the plugin in the config file. It stores a pointer to `setup` function to the each package (in the config json).
2. To find the `setup` function of the package, `resolveConfig` uses `resolveModeule`.
3. `resolveModule` loads tags from package.json (provides, consumes, etc) and adds them to config data structure.
4. `resolvePackage` checks if the files for the package exist.

`loadConfig` returns a parsed structure that is passed to `createApp` for creating the app in next stage. 

## Initialization - step 2 - `createApp`

The function `createApp` creates an object internally (`Archie` and returns it to the user app).The constructor of the object calls a function `loadPlugins`, which loads all plugins and calls their setup functions.

    createApp
     |
     +-> new Archie()
         |
         +-> loadPlugins
             |
             +-> Sorts the config (line 400)
             +-> registerPlugin
                 |
                 +-> Checks for dependencies (consumes)
                 +-> Calls plugin.setup function
                 +-> In Register callback (see line 451)
                     |
                     +-> Populates a data-structure `services` (in app.services)

### About Archie object

The other part of Archie.js is an object by the name of Archie. (see line 362)

        function Archie(config) {
            ...

Archie object is derived from event emitter interface and emits useful events for the nodejs app using it. (see line 385)


Archie object provides a function with the name, getServices. We can use it to access any of the loaded services.


## Data structures exposed to the user (nodejs app)

## package.json

{
    ...
    plugins: {
        provides: ['give1', ...],
        consumes: ['take1', ...],
        messaging: 'one of the possible types'
    }
}


### Config that loads packages

{
    packagePath: '...',
    key1: '...',
    key2: 123
}

During the initialization part, the plugins from package.json are merged into the config that is present in the memory. This combined structure is returned by `loadConfig` function and is supposed to be passed into `createApp`.

### app

The callback to `createApp` function contains the `app` datastructure. This datastructure is used both internally and also provided to the user. Its contents are as follows :-

{
    services: {...},   // a hash of services in this app
    config: {...},     // the config defined in the last section
    event: {}          // events emitted by Archie object (ready, error, etc)
}
