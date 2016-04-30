'use strict';

require('./inherit');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var resolve = require('path').resolve;
var basedir = resolve(__dirname, '..');

var Archiejs = require('./../../');
var baseEnhancer;

describe('Base Enhancer Testcases:', function(){

    before(function(done) {
        baseEnhancer = new Archiejs.BaseEnhancerClass();
        done();
    });

    it('enhancer has a name', function(done){
        baseEnhancer.enhancerName.should.equal('base');
        done();
    });

    it('enhancer accepts strings in config', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
            provides: 'something',
            consumes: 'something'
        };
        baseEnhancer.resolveConfig(config, basedir);
        Array.isArray(config.consumes).should.equal(true);
        Array.isArray(config.provides).should.equal(true);
        config.consumes[0].should.equal('something');
        config.provides[0].should.equal('something');
        done();
    });

    it('enhancer accepts null in config', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
            consumes: null,
            provides: null
        };
        baseEnhancer.resolveConfig(config, basedir);
        config.consumes.length.should.equal(0);
        config.provides.length.should.equal(0);
        done();
    });

    it('enhancer accepts json input in provides', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
            provides: {
                'Obj1': 'serviceObj1',
                'Obj2': 'serviceObj2'
            }
        };
        baseEnhancer.resolveConfig(config, basedir);

        config.provides.length.should.equal(2);
        config.enhancers.should.have.property('Obj1');
        config.enhancers.should.have.property('Obj2');
        done();
    });

    it('enhancer setups the plugin with json input in provides', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
            provides: {
                'Obj1': 'serviceObj1',
                'Obj2': 'serviceObj2'
            }
        };
        baseEnhancer.resolveConfig(config, basedir);
        baseEnhancer.setupPlugin(config, {}, 
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
    
    it('enhancer accepts nested json input', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
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
        baseEnhancer.resolveConfig(config, basedir);
       
        config.provides.length.should.equal(6);
        config.enhancers.should.have.property('Parent1.Obj1');
        config.enhancers.should.have.property('Parent1.Obj2');
        config.enhancers.should.have.property('Parent2.Obj1');
        config.enhancers.should.have.property('Parent2.Obj2');
        done();
    });

    it('enhancer accepts nested json input and setups plugin', function(done){
        var config = {
            packagePath: 'base_enhancer_class',
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
        baseEnhancer.resolveConfig(config, basedir);
        baseEnhancer.setupPlugin(config, {}, 
            function(err, serviceMap){
                if(err) {
                    throw err;
                }
                serviceMap.should.have.property('Parent1');
                serviceMap.should.have.property('Parent2');
                config.enhancers.should.have.property('Parent1.Obj1');
                config.enhancers.should.have.property('Parent1.Obj2');
                config.enhancers.should.have.property('Parent2.Obj1');
                config.enhancers.should.have.property('Parent2.Obj2');
                expect(serviceMap.Parent1.Obj1).instanceof( require('./serviceObj1') );
                expect(serviceMap.Parent1.Obj2).instanceof( require('./serviceObj2') );
                expect(serviceMap.Parent2.Obj1).instanceof( require('./serviceObj1') );
                expect(serviceMap.Parent2.Obj2).instanceof( require('./serviceObj2') );
                done();
            }
        );
    });

});
