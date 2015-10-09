'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var async = require('async');

var ServiceObj1 = require('./serviceObj1'); // object
var ServiceObj2 = require('./serviceObj2'); // object
var ServiceInt = require('./serviceIntf'); // interface

var KueWrapper = require('./../').KueWrapper;
var kueWrapper;

// redis config
var config = {
    prefix: 'a',
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
        var config = {
            packagePath: 'test',
            provides: {
                'Obj1': {
                    implementation: 'serviceObj1',
                    interface: 'serviceObj1'
                },
                'Obj2': 'serviceObj2'
            }
        };
        var configClient = JSON.parse(JSON.stringify(config));
        var configServer = JSON.parse(JSON.stringify(config));
        configClient.packageRole = 'client';
        configServer.packageRole = 'server';
        
        async.waterfall([
            function(cb){
                // check resolveConfig client
                kueWrapper.resolveConfig(configClient);
                configClient.provides.length.should.equal(2);
                configClient.wrappers.should.have.property('Obj1');
                configClient.wrappers.should.have.property('Obj2');
                cb();
            },
            function(cb){
                // check resolveConfig server
                kueWrapper.resolveConfig(configServer);
                configServer.provides.length.should.equal(0);
                cb();
            },
            function(cb){
                // check resolveConfig setupPlugin
                kueWrapper.setupPlugin(configServer, {}, cb);
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

                        serviceMap.Obj1.func1();
                        serviceMap.Obj1.func2();
                        serviceMap.Obj1.func3();
                
                        expect(serviceMap.func1_count).to.equal(1);
                        expect(serviceMap.func2_count).to.equal(1);
                        expect(serviceMap.func3_count).to.equal(1);
                        cb();
                    }
                );
            }],
            done
        );
    });

}); 
