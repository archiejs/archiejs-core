'use strict';

require('./../../misc');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var async = require('async');
var resolve = require('path').resolve;
var basedir = resolve(__dirname, '..');

var MongoWrapper = require('./../');
var mongoWrapper;

var configTest = {
    packagePath: 'test',
    provides: {
        'Person': 'schema.js'
    },
    mongoose: require('mongoose'),
    server: {
        uri: 'mongodb://localhost/testDB'
    },
    debug: true
};

describe('Mongo Wrapper Testcases:', function(){

    before(function(){
        mongoWrapper = new MongoWrapper();
    });

    afterEach(function(){
        mongoWrapper.closeClient();
    });

    it('#reads/writes to mongodb', function(done){
        this.timeout(10000);
        var db;
        async.waterfall([
            function(cb){
                mongoWrapper.resolveConfig(configTest, basedir);
                configTest.provides.length.should.equal(1);
                configTest.wrappers.should.have.property('Person');
                cb();
            },
            function(cb){
                mongoWrapper.setupPlugin(configTest, {},
                    function(err, services){
                        db = services;
                        db.should.have.property('Person');
                        cb();
                    }
                );
            },
            // write data
            function(cb){
                var person = new db.Person({
                    name: 'dolly',
                    age: 2
                });
                person.save(function(err, data) {
                    expect(err).to.not.exist;
                    expect(data._id).to.exist;
                    data.name.should.equal('dolly');
                    data.age.should.equal(2);
                    return cb();
                });
            },
            // read data
            function(cb){
                db.Person.findOne({name: 'dolly'},
                function(err, data){
                    expect(err).to.not.exist;
                    expect(data._id).to.exist;
                    data.name.should.equal('dolly');
                    data.age.should.equal(2);
                    return cb();
                });
            }
        ], done);
    });

});
