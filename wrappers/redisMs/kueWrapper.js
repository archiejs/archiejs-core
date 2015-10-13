'use strict';
var resolve = require('path').resolve;
var kue = require('kue');

var MicroserviceWrapper = require('./../core').MicroserviceWrapper;

var KUE_TIMEOUT = 5000;
var DEBUG = false;

var KueWrapper = function(){
    MicroserviceWrapper.call(this); // override functions
    this.wrapperName = "kuewrapper";
    this.redisConfig = {};

    // todo (check - is it better to register/unregister this in open/closeClient)
    var me = this;
    process.once( 'exit', function (sig) {
        me.closeClient();
    });
};

KueWrapper.extends(MicroserviceWrapper);

KueWrapper.HELP_MSG = "\
Your config should have following fields.  \n\
  {                        \n\
    prefix: optional,  \n\
    server: {              \n\
      host: HOST ,         \n\
      port: PORT ,         \n\
      username: optional , \n\
      password: optional   \n\
    }                      \n\
  }";

(function(){

    this.setupPlugin = function(plugin, imports, register){
        // open redis session first
        if(!plugin.prefix) plugin.prefix="";
        this.redisConfig = {
            redis: plugin.server,
            prefix: plugin.prefix
        };
        this.openClient();

        // this uses the redis session
        this.super.setupPlugin.call(this, plugin, imports, register);
    };

    this.openClient = function(){
        if(!this.redisConfig.redis || !this.redisConfig.redis.host || !this.redisConfig.redis.port){
            console.log(KueWrapper.HELP_MSG);
            throw new Error("Archiejs kue wrapper plugin error");
        }
        this.jobsClient = kue.createQueue(this.redisConfig);
    };

    this.closeClient = function(cb){
        var me = this;
        if(me.jobsClient){
            me.jobsClient.shutdown(KUE_TIMEOUT, function(err){
                me.jobsClient = null;
                cb && cb(err);
            });
        }else{
            cb && cb();
        } 
    };

    this.getClient = function(){
        return this.jobsClient;
    };

    this.makePluginWrapper = function(serviceName, functionName){
        // unique service name
        var jobKey = serviceName + '.' + functionName;
        var me = this;

        // return a wrapper function that fires the job
        return function(){
                //console.log("called " + jobKey);

                // pop data from arguments and make RPC call
                var _a = me.parseServiceArgs(arguments);
                var data = _a.data;
                var options = _a.options;
                var cb = _a.callback;

                // create a job
                var job = me.jobsClient.create(jobKey, data);

                // properties
                if(options.priority){
                    job.priority(options.priority);
                }
                if(options.attempts){
                    job.priority(options.attempts);
                }

                // fire the job
                job.save(function(err){
                    if(DEBUG) console.log("job save " + jobKey);
                    if(err) return cb(err);
                })
                .on('failed', function(err){
                    if(DEBUG) console.log("job failed " + jobKey);
                    return cb(err);
                })
                .on('complete', function(result){
                    if(DEBUG) console.log("job complete " + jobKey);
                    return cb(null, result);
                });

                // return to user to update any options
                return job;
            };
    };

    this.makePluginHook = function(serviceName, functionName, serviceInstance){
        // unique service name
        var jobKey = serviceName + '.' + functionName;
        var me = this;

        // create hook
        this.jobsClient.process( jobKey, function(job, done){
            var _data = me.createServiceArgs(job.data, done);
            serviceInstance[functionName].apply(serviceInstance, _data);
            return;
        });
    };

}).call(KueWrapper.prototype);

module.exports = KueWrapper;
