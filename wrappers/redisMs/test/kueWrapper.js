'use strict';

require('./../../misc');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var async = require('async');
var resolve = require('path').resolve;

var ServiceObj1 = require('./kueTestObj1'); // object
var ServiceObj2 = require('./kueTestObj2'); // object
var ServiceInt = require('./serviceIntf'); // interface

var KueWrapper = require('./../').KueWrapper;
var kueWrapper;

// redis config
var redisConfig = {
    server: {
        host: '127.0.0.1',
        port: 6379
    }
};

describe('Kue Wrapper Testcases:', function(){
    
    before(function(){
        kueWrapper = new KueWrapper();
    });

    afterEach(function(){
        kueWrapper.closeClient();
    });

    it('#makes rpc calls', function(done){
        // create producer - consumer
        var count = 0;
        var serviceInstances;
        var basedir = resolve(__dirname, '..');
        var config = {
            packagePath: 'test',
            provides: {
                'Obj1': {
                    implementation: 'kueTestObj1',
                    interface: 'serviceIntf'
                },
                'Obj2': 'kueTestObj2'
            },
            server: redisConfig.server,
            prefix: redisConfig.prefix
        };
        var configClient = JSON.parse(JSON.stringify(config));
        var configServer = JSON.parse(JSON.stringify(config));
        configClient.packageRole = 'client';
        configServer.packageRole = 'server';

        async.waterfall([
            function(cb){
                // check resolveConfig client
                kueWrapper.resolveConfig(configClient, basedir);
                configClient.provides.length.should.equal(2);
                configClient.wrappers.should.have.property('Obj1');
                configClient.wrappers.should.have.property('Obj2');
                cb();
            },
            function(cb){
                // check resolveConfig server
                kueWrapper.resolveConfig(configServer, basedir);
                configServer.provides.length.should.equal(0);
                cb();
            },
            function(cb){
                // check resolveConfig setupPlugin
                kueWrapper.setupPlugin(configServer, {},
                    function(err, services){
                        serviceInstances = services;
                        cb(); 
                    }
                );
            },
            function(cb){
                // check setupPlugin client
                kueWrapper.setupPlugin(configClient, {}, 
                    function(err, serviceMap){
                        if(err) {
                            throw err;
                        }

                        serviceMap.should.have.property('Obj1');
                        serviceMap.should.have.property('Obj2');

                        serviceMap.Obj1.func1( function(){ count++; } );
                        serviceMap.Obj1.func2( function(){ count++; } );
                        serviceMap.Obj1.func3( function(){ count++; } );

                        setTimeout(cb, 1000);
                    }
                );
            },
            function(cb){
                var isNotEmpty = Object.keys(serviceInstances).length > 0;
                if(isNotEmpty){
                    console.log( serviceInstances.Obj1 );
                    serviceInstances.Obj1.func1_count.should.equal(1);
                    serviceInstances.Obj1.func2_count.should.equal(1);
                    serviceInstances.Obj1.func3_count.should.equal(1);
                }else{
                    console.error("ALERT! Turn on DEBUG=true in core/microservice.js for testing RPC calls.");
                }
                count.should.equal(3);
                cb();
            }],
            done
        );
    });

}); 
