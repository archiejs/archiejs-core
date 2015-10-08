'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

require('./../../../misc.js');
var MicroWrapper = require('./../microservice.js');
var ServiceObj = require('./serviceObj1.js');

var microWrapper = new MicroWrapper();

describe('Microservice Wrapper Testcases:', function(){

    it('wrapper has a name', function(done){
        microWrapper.wrapperName.should.equal('microservice');
        done();
    });

    it('test resolveConfig with null values', function(done){
        var config = {
            packagePath: 'test',
            consumes: null,
            provides: null
        };
        microWrapper.resolveConfig(config);
        config.consumes.length.should.equal(0);
        config.provides.length.should.equal(0);
        done();
    });

    it('test resolveConfig with `default` packageRole - test1', function(done){
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
        microWrapper.resolveConfig(config);
        config.provides.length.should.equal(2);
        config.interfaces.should.have.property('Obj1');
        config.interfaces.should.have.property('Obj2');
        done();
    });
    
    it('test resolveConfig with `client` packageRole', function(done){
        var config = {
            packageRole: 'client',
            packagePath: 'test',
            provides: {
                'Obj1': {
                    implementation: 'serviceObj1',
                    interface: 'serviceObj1'
                },
                'Obj2': 'serviceObj2'
            }
        };
        microWrapper.resolveConfig(config);
        config.provides.length.should.equal(2);
        config.interfaces.should.have.property('Obj1');
        config.interfaces.should.have.property('Obj2');
        done();
    }); 
    
    it('test resolveConfig with `server` packageRole', function(done){
        var config = {
            packageRole: 'server',
            packagePath: 'test',
            provides: {
                'Obj1': {
                    implementation: 'serviceObj1',
                    interface: 'serviceObj1'
                },
                'Obj2': 'serviceObj2'
            }
        };
        microWrapper.resolveConfig(config);
        config.provides.length.should.equal(0);
        config.interfaces.should.have.property('Obj1');
        config.interfaces.should.have.property('Obj2');
        done();
    }); 

    it('test setupPlugin for default packageRole', function(done){
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
        microWrapper.resolveConfig(config);
        microWrapper.setupPlugin(config, {}, 
            function(err, serviceMap){
                if(err) {
                    throw err;
                }
                serviceMap.should.have.property('Obj1');
                serviceMap.should.have.property('Obj2');
                expect(serviceMap.Obj1).instanceof( require('./serviceObj1') );
                expect(serviceMap.Obj2).instanceof( require('./serviceObj2') );
                done();
            }
        );
    });

});
