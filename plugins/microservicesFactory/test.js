'use strict';

var Archie = require('./../../../archiejs');

var tree = Archie.resolveConfig(
[{
    packagePath: './'
}], __dirname);

Archie.createApp(tree, function(err, app){
    if(err){
        return console.log(err);
    }

    console.log('loaded module...');

    // setup kue based microservice
    var config = {
        prefix: 'a',
        server: {
            host: '127.0.0.1',
            port: 6379
        }
    };
    var KueWrapperFactory = app.getService("archieKueMicroserviceFactory");
    var kueFactory = new KueWrapperFactory(config);

    // create producer - consumer
    var client = kueFactory.makeWrappers(ServiceObj);
    var serviceInst = new ServiceObj();
    kueFactory.makeHooks(ServiceObj, serviceInst);

    console.log("making function calls");
    client.func1();
    client.func2();
    client.func3();
});

var ServiceObj = function(){
    console.log("created service objects");
};

(function(){
    this.func1 = function(){
        console.log("inside func1");
    };

    this.func2 = function(){
        console.log("inside func2");
    };
    
    this.func3 = function(){
        console.log("inside func3");
    };
}).call(ServiceObj.prototype);


