'use strict';

require('./../../misc');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname, '..');

var BaseWrapper = require('./../').BaseWrapper;
var ServiceObj = require('./serviceObj1.js');

var baseWrapper = new BaseWrapper();

describe('Base Wrapper Testcases:', function(){

    it('wrapper has a name', function(done){
        baseWrapper.wrapperName.should.equal('base');
        done();
    });

    it('wrapper accepts strings in config', function(done){
        var config = {
            packagePath: 'test',
            provides: 'something',
            consumes: 'something'
        };
        baseWrapper.resolveConfig(config, basedir);
        Array.isArray(config.consumes).should.equal(true);
        Array.isArray(config.provides).should.equal(true);
        config.consumes[0].should.equal('something');
        config.provides[0].should.equal('something');
        done();
    });

    it('wrapper accepts null in config', function(done){
        var config = {
            packagePath: 'test',
            consumes: null,
            provides: null
        };
        baseWrapper.resolveConfig(config, basedir);
        config.consumes.length.should.equal(0);
        config.provides.length.should.equal(0);
        done();
    });

    it('wrapper accepts json input in provides', function(done){
        var config = {
            packagePath: 'test',
            provides: {
                'Obj1': 'serviceObj1',
                'Obj2': 'serviceObj2'
            }
        };
        baseWrapper.resolveConfig(config, basedir);

        config.provides.length.should.equal(2);
        config.wrappers.should.have.property('Obj1');
        config.wrappers.should.have.property('Obj2');
        done();
    });

    it('wrapper setups the plugin with json input in provides', function(done){
        var config = {
            packagePath: 'test',
            provides: {
                'Obj1': 'serviceObj1',
                'Obj2': 'serviceObj2'
            }
        };
        baseWrapper.resolveConfig(config, basedir);
        baseWrapper.setupPlugin(config, {}, 
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
    
    it('wrapper accepts nested json input', function(done){
        var config = {
            packagePath: 'test',
            provides: {
                'Parent1': {
                    'Obj1': 'serviceObj1',
                    'Obj2': 'serviceObj2'
                },
                'Parent2': {
                    'Obj1': 'serviceObj1',
                    'Obj2': 'serviceObj2'
                }
            }
        };
        baseWrapper.resolveConfig(config, basedir);
       
        config.provides.length.should.equal(6);
        config.wrappers.should.have.property('Parent1.Obj1');
        config.wrappers.should.have.property('Parent1.Obj2');
        config.wrappers.should.have.property('Parent2.Obj1');
        config.wrappers.should.have.property('Parent2.Obj2');
        done();
    });

    it('wrapper accepts nested json input and setups plugin', function(done){
        var config = {
            packagePath: 'test',
            provides: {
                'Parent1': {
                    'Obj1': 'serviceObj1',
                    'Obj2': 'serviceObj2'
                },
                'Parent2': {
                    'Obj1': 'serviceObj1',
                    'Obj2': 'serviceObj2'
                }
            }
        };
        baseWrapper.resolveConfig(config, basedir);
        baseWrapper.setupPlugin(config, {}, 
            function(err, serviceMap){
                if(err) {
                    throw err;
                }
                serviceMap.should.have.property('Parent1');
                serviceMap.should.have.property('Parent2');
                config.wrappers.should.have.property('Parent1.Obj1');
                config.wrappers.should.have.property('Parent1.Obj2');
                config.wrappers.should.have.property('Parent2.Obj1');
                config.wrappers.should.have.property('Parent2.Obj2');
                expect(serviceMap.Parent1.Obj1).instanceof( require('./serviceObj1') );
                expect(serviceMap.Parent1.Obj2).instanceof( require('./serviceObj2') );
                expect(serviceMap.Parent2.Obj1).instanceof( require('./serviceObj1') );
                expect(serviceMap.Parent2.Obj2).instanceof( require('./serviceObj2') );
                done();
            }
        );
    });

});
