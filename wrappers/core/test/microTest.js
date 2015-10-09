'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var MicroWrapper = require('./../').MicroserviceWrapper;
var ServiceObj = require('./serviceObj1.js');
var ServiceIntf = require('./serviceIntf.js');

/***
 * Derived Microservice Wrapper 
 ***/
var DerivedMSWrapper = function(){
    MicroWrapper.call(this);
    this.keys = [];
};
DerivedMSWrapper.extends(MicroWrapper);
DerivedMSWrapper.prototype.makePluginWrapper = function(serviceName, functionName){
    var key = serviceName + "." + functionName;
    return function() { return key; };
};
DerivedMSWrapper.prototype.makePluginHook = function(serviceName, functionName){
    var key = serviceName + "." + functionName;
    this.keys.push(key);
};
/*** end ***/

var microWrapper;

describe('Microservice Wrapper Testcases:', function(){

    beforeEach(function(){
        microWrapper = new MicroWrapper();
    });

    it('tests that wrapper has a name', function(done){
        microWrapper.wrapperName.should.equal('microservice');
        done();
    });

    it('tests resolveConfig with null values', function(done){
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

    it('tests resolveConfig with default package - tests1', function(done){
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
        config.wrappers.should.have.property('Obj1');
        config.wrappers.should.have.property('Obj2');
        done();
    });
    
    it('tests resolveConfig for client package', function(done){
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
        config.wrappers.should.have.property('Obj1');
        config.wrappers.should.have.property('Obj2');
        done();
    }); 
    
    it('tests resolveConfig with `server` packageRole', function(done){
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
        config.wrappers.should.have.property('Obj1');
        config.wrappers.should.have.property('Obj2');
        done();
    }); 

    it('tests setupPlugin for default package', function(done){
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

    describe('tests setupPlugin for client-server function', function(){

        beforeEach(function(){
            microWrapper = new DerivedMSWrapper();
        });

        it('tests setupPlugin for client package', function(done){
            var config = {
                packagePath: 'test',
                packageRole: 'client',
                provides: {
                    'Obj1': {
                        implementation: 'serviceObj1',
                        interface: 'serviceIntf'
                    }
                }
            };
            microWrapper.resolveConfig(config);
            microWrapper.setupPlugin(config, {},
                function(err, serviceMap){
                    if(err){
                        throw err;
                    }
                    var client = serviceMap.Obj1;
                    client.func1().should.equal('Obj1.func1');
                    client.func2().should.equal('Obj1.func2');
                    client.func3().should.equal('Obj1.func3');
                    done();
                }
            );
        });
        
        it('tests setupPlugin for server package', function(done){
            var config = {
                packagePath: 'test',
                packageRole: 'server',
                provides: {
                    'Obj1': {
                        implementation: 'serviceObj1',
                        interface: 'serviceIntf'
                    }
                }
            };
            microWrapper.resolveConfig(config);
            microWrapper.setupPlugin(config, {},
                function(err){
                    if(err){
                        throw err;
                    }
                    microWrapper.keys.should.have.length(3);
                    microWrapper.keys.should.contain('Obj1.func1');
                    microWrapper.keys.should.contain('Obj1.func2');
                    microWrapper.keys.should.contain('Obj1.func3');
                    done();
                }
            );
        });

    });

});
