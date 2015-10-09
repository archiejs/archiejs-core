'use strict';
var resolve = require('path').resolve;

var MicroserverWrapper = require('./../core/microservice.js');

var KueWrapper = function(){
    MicroserverWrapper.call(this);
    this.wrapperName = "kuewrapper";
    this.redisConfig = {};

    // todo
    // check - is it better to register/unregister this in open/closeClient
    process.once( 'SIGTERM', function (sig) {
        me.closeClient();
    });
};

KueWrapper.extends(MicroserverWrapper);

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
        this.super.setupPlugin.call(this, plugin, imports, register);

        if(!plugin.prefix) plugin.prefix="";
        this.redisConfig = {
            redis: plugin.server,
            prefix: plugin.prefix
        };
        this.openClient();
    };

    this.openClient = function(){
        if(!plugin.server || !plugin.server.host || !plugin.server.port){
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

        // return a wrapper function that fires the job
        return
            function(){
                // pop data from arguments and make RPC call
                var _a = this.parseArguments(arguments);
                var data = p.data;
                var options = p.options;
                var cb = p.callback;

                // create a job
                var job = me.jobsClient.create(jobKey, _a.data);

                // properties
                if(_a.options.priority){
                    job.priority(_a.options.priority);
                }
                if(_a.options.attempts){
                    job.priority(_a.options.attempts);
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

        // create hook
        me.jobsClient.process( jobKey, function(job, cb){
            serviceInstance[jobKey] (job.data, cb);
        });
    };

}).call(KueWrapper.prototype);

module.exports = KueWrapper;






