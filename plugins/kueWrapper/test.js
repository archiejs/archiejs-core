'use strict';

var Archie = require('./../../../archie.js');

var tree = Archie.resolveConfig(
[{
    packagePath: './',
}], __dirname);

Archie.createApp(tree, function(err, app){
    if(err){
        return console.log(err);
    }

    console.log('loaded module');
});

var ServiceObj = function(){
};

(function(){
    this.func1 = function(){
    };

    this.func2 = function(){
    };
    
    this.func3 = function(){
    };
}).call(ServiceObj.prototype);


