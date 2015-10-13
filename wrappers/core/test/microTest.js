'use strict';

require('./../../misc');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname, '..');

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
        microWrapper.resolveConfig(config, basedir);
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
        microWrapper.resolveConfig(config, basedir);
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
        microWrapper.resolveConfig(config, basedir);
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
        microWrapper.resolveConfig(config, basedir);
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
        microWrapper.resolveConfig(config, basedir);
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
            microWrapper.resolveConfig(config, basedir);
            microWrapper.setupPlugin(config, {},
                function(err, serviceMap){
                    if(err){
                        throw err;
                    }
                    var client = serviceMap.Obj1;
                    client.add().should.equal('Obj1.add');
                    client.sub().should.equal('Obj1.sub');
                    client.mult().should.equal('Obj1.mult');
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
            microWrapper.resolveConfig(config, basedir);
            microWrapper.setupPlugin(config, {},
                function(err){
                    if(err){
                        throw err;
                    }
                    microWrapper.keys.should.have.length(3);
                    microWrapper.keys.should.contain('Obj1.add');
                    microWrapper.keys.should.contain('Obj1.sub');
                    microWrapper.keys.should.contain('Obj1.mult');
                    done();
                }
            );
        });

    });

    it('tests parseArgument helper function', function(done){
        var args = {
            "0": 10,
            "1": {
                "fast": "ball",
                "cricket": "bat"
            },
            "2": function(){
                return "callback";
            },
            "3": {
                "options": true
            }
        };

        var result = microWrapper.parseServiceArgs(args);
        var data = result.data;
        var callback = result.callback
        var options = result.options;

        data[0].should.equal(10);
        data[1].fast.should.equal("ball");
        data[1].cricket.should.equal("bat");
        callback().should.equal("callback");
        options.options.should.equal(true);
        done();
    });

    it('tests createArguments helper function', function(done){
        var json = {
            "0": 10,
            "1": {
                "fast": "ball",
                "cricket": "bat"
            }
        };
        var callback = function(){
            return "callback";
        };

        var args = microWrapper.createServiceArgs(json, callback);
        args[0].should.equal(10);
        args[1].fast.should.equal("ball");
        args[1].cricket.should.equal("bat");
        args[2]().should.equal("callback");
        done();
    });
});
