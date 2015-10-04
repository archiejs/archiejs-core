'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var Archie = require('./../../../../archiejs');
var ServiceObj = require('./serviceObj');

var KueWrapperFactory;
var kueFactory;

// redis config
var config = {
    prefix: 'a',
    server: {
        host: '127.0.0.1',
        port: 6379
    }
};

describe('Kue Redis Wrapper Testcases:', function(){

    // create an Archie app

    before(function(){
        var tree = Archie.resolveConfig(
        [{
            packagePath: '../'
        }], __dirname);

        Archie.createApp(tree, function(err, app){
            if(err)
                return console.log(err);
            KueWrapperFactory = app.getService("archieKueMicroserviceFactory");
        });
    });

    beforeEach(function(){
        kueFactory = new KueWrapperFactory(config);
    });

    afterEach(function(){
        kueFactory.closeClient();
    });

    it('test creation', function(done){
        expect(kueFactory.jobsClient).to.not.equal(null);
        done();
    });

    it('test closing', function(done){
        kueFactory.closeClient(function(err){
            expect(err).to.not.equal(null);
            expect(kueFactory.jobsClient).to.equal(null);
        });
        done();
    });

    it('test wrapper', function(done){
        // create producer - consumer
        var client = kueFactory.makeWrappers(ServiceObj);
        expect(client.func1).to.not.equal(null);
        expect(client.func2).to.not.equal(null);
        expect(client.func3).to.not.equal(null);
        done();
    });

    it('test service', function(done){
        var serviceInst = new ServiceObj();
        kueFactory.makeHooks(ServiceObj, serviceInst);
        
        var client = kueFactory.makeWrappers(ServiceObj);
        client.func1();
        client.func2();
        client.func3();

        setTimeout(function(){
            expect(serviceInst.func1_count).to.equal(1);
            expect(serviceInst.func2_count).to.equal(1);
            expect(serviceInst.func3_count).to.equal(1);
            done();
        },100);
    });
});

