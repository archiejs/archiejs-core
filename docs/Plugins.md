# Plugins

## What are plugins?

Plugins break your application into modular logic. 

Plugins provide (`provides`) various services to the application and at the same time can consume (`consumes`) other services (provided by other plugins).
Thus plugins also provide a dependency management system which is more robust than require. The dependencies are checked at compile time.

Thus plugins break down the server code and make it more reusable, they have other usecases also. 
For instance, they can be wrapped and launched as a separate microservers and normal function calls to them would be made via redis.
In case of database schemas, plugins can provide schemas as wrappers, thus making it extremely clear as to which module/plugin is accessing which database schemas.

There are various ways to define a plugin.

## Required knowledge

You are required to know the structure of an Archiejs project.

## How are plugins structured?

### Plugin type 1 - dependencies in package.json 

In this method, the linking of services done by ArchieJS. Least amount of code needs to be written.

Extracts from `package.json`.

    {
        main: '',
        plugin: {
            provides: {
                'service1' : 'source1.js',
                'service2' : 'source2.js'
            },
            consumes: [ 'serviceA', 'serviceB' ]
        }
    }

Structure of `source1.js` file (javascript prototype objects).

    var Service1 = function(config, imports){
        ...
        var serviceA = imports.serviceA;
        var serviceB = imports.serviceB;
        ...
    };

    Service1.prototype.func1 = function(){ ... }
    Service1.prototype.func2 = function(){ ... }

In this case, Archiejs automatically creates instances for these objects.
This structure of plugins is also needed when we want to wrap these objects as microservices automatically.

For most cases, this is the structure we recommend.

### Plugin type 2 - dependencies in package.json 

In this method, the linking of services done in a setup function. 
This requires writing some extra code and is provided mostly for legacy reasons (derived froma archietect.js).  

The file package.json is created via `npm init` (TODO create archiejs generators for plugins).

Extracts from `package.json`.

    {
        main: 'sourcecode.js',
        plugin: {
            provides: [ 'service1', 'service2' ],
            consumes: [ 'serviceA', 'serviceB' ]
        }
    }

The file `sourcedode.js` exports a setup function which registers the provided services.

    var setup = function(config, imports, register){
        ...
        var serviceA = imports.serviceA;
        var serviceB = imports.serviceB;
        ...
        register(err, // or null
            {
                service1: ... ,
                service2: ...
            }
        );
    };

This is requires us to write a little more code than the last method of creating plugins.
Also the way to create wrappers and hooks for microservice architectures is more manual. (explained later).

### Plugin type 3 - dependencies exported in code

In this case, there is no package.json .
The config has the full path to the javascripe file (see below section to know more about config).

Let's say the name of the file is `plugin.js`.
It is structured as follows,

    'use strict';

    plugin.consumes = [ 'eatServiceA' ];
    plugin.provides = [ 'giveService1' ];
    module.exports = plugin;

    function plugin(options, imports, register){
        register( err, {
            giveService1 : function() {}
        });
    }

We mostly recommend the other ways. This is something legacy from architect.js and its main purpose was to make the code runnable between client-server and also perhaps for on demand loading of the code on client side. We have not gone much into this usecase and it is not relevant to architect.js . But just in case, you dont like another file package.json, this is for you then.


## How does the app consume plugins?

### 1. Create a config

    var appConfig = [
        'plugins/plug1',
        {
            packagePath: 'plugins/plug2',

            // other options
            option1: 100,
            option2: 'value'
        },
        {
            packagePath: 'plugins/plug3',
            packageWrapper: 'archie-redis-kue',  // makes this a microservice
            packageRole: 'client',  // or can also be server
            
            // other config options
            // ...
        }
    ];

    var tree = architect.resolveConfig(appConfig, __dirname);

### 2. Launch the app

    var architect = require('architect');
    architect.createApp(tree, function() {
        console.log('Application started');
    });


## What `packageWrapper` types are available in Archiejs?

TODO




