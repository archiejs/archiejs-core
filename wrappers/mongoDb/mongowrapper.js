'use strict';
var mongoose = require('mongoose');

var DEBUG = true;

// TODO fix bug in deep inheritence
//var DbWrapper = require('./../core').DbWrapper;
var DbWrapper = require('./../core').BaseWrapper;

var MongodbWrapper = function(){
    DbWrapper.call(this);
    this.wrapperName = "mongodbwrapper";
    this.__registerClass = true;
    this.mongoConfig = {};

    // todo (check - is it better to register/unregister this in open/closeClient)
    var me = this;
    process.once( 'exit', function (sig) {
        me.closeClient();
    });
};

MongodbWrapper.extends(DbWrapper);

MongodbWrapper.HELP_MSG = "\
Your config shold have following fields. \n\n\
  { \n\
    server: { \n\
      uri: URI, \n\
      username/user: optional, \n\
      password/pass: optional \n\
    } \n\
  }";

(function(){

    this.setupPlugin = function(plugin, imports, register){
        if(DEBUG) console.log('mongo: setupPlugin');
        if(!plugin.server){
            console.log(MongodbWrapper.HELP_MSG);
            throw new Error("Archiejs mongodb wrapper plugin should specify a server.");
        }
        this.mongoConfig = {
            uri: plugin.server.uri,
            options: {
                user: plugin.server.username || plugin.server.user || '',
                pass: plugin.server.password || plugin.server.pass || ''
            },
            // Enable mongoose debug mode
            debug: plugin.debug || process.env.MONGODB_DEBUG || false
        };
        this.super.setupPlugin.call(this, plugin, imports, register);
        this.openClient();
    };

    this.openClient = function(cb){
        if(DEBUG) console.log('mongo: openClient');
        var me = this;
        if(!this.mongoConfig.uri){
            console.log(MongodbWrapper.HELP_MSG);
            throw new Error("Archiejs mongodb wrapper plugin should have uri.");
        }
        this.db = mongoose.connect(this.mongoConfig.uri, this.mongoConfig.options,
            function(err){
                if(err){
                    console.error('Count not connect to mongodb');
                    console.log(err);
                } else {
                    mongoose.set('debug', me.mongoConfig.debug);
                }
                if(cb)
                    cb(err);
            }
        );
    };

    this.closeClient = function(cb){
        if(DEBUG) console.log('mongo: closeClient');
        mongoose.disconnect(function(err){
            console.info('Disconnected from mongodb');
            if(cb) cb(err);
        });
    };

    this.getClient = function(cb){
        if(DEBUG) console.log('mongo: getClient');
        return this.db;
    };

}).call(MongodbWrapper.prototype);

module.exports = MongodbWrapper;
