'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

require('./../../../misc.js');
var BaseWrapper = require('./../base.js');
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
        baseWrapper.resolveConfig(config);
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
        baseWrapper.resolveConfig(config);
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
        baseWrapper.resolveConfig(config);

        config.provides.length.should.equal(2);
        config.interfaces.should.have.property('Obj1');
        config.interfaces.should.have.property('Obj2');
        done();
    });

    it('wrapper accepts json input and setups plugin', function(done){
        var config = {
            packagePath: 'test',
            provides: {
                'Obj1': 'serviceObj1',
                'Obj2': 'serviceObj2'
            }
        };
        baseWrapper.resolveConfig(config);
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

});
