'use strict';

var kue = require('kue');
var DEBUG = false;

var KueMicroservice = function(config) {
    var serviceName = "test";

    // validations
    if(!config || !config.server || !config.server.host || !config.server.port) {
        console.log
            (
                    "Please specify a config    \n\n"
                +   "  {                        \n"
                +   "    prefix: prefix,        \n"
                +   "    server: {              \n"
                +   "      host: HOST ,         \n"
                +   "      port: PORT ,         \n"
                +   "      username: optional , \n"
                +   "      password: optional   \n"
                +   "    }                      \n"
                +   "  }                        \n"
            );
        throw "Error: archie-kue-wrapper config error";
    }

    if(!config.prefix) config.prefix="";
    
    // member variables
    this.serviceName = serviceName;
    this.jobsClient = kue.createQueue({
        prefix: config.prefix,
        redis: config.server
    });
};

(function(){
    this.makeWrappers = function(ServiceObj){
        var me = this;
 
        // validation
        if(ServiceObj == null || ServiceObj.prototype == null){
            var err = new Error("no service object or empty prototype");
            throw err;
        }

        // create wrapper
        var result = Object.create({});
        for(var property in ServiceObj.prototype){
            (function(property){
                result[property] = function(){
                    // unique service name
                    var jobKey = me.serviceName + '.' + property;

                    // pop data from arguments and make RPC call
                    var p = me._parseArguments(arguments);
                    me._fireJob(jobKey, p.data, p.options, p.callback);
                };
            })(property);
        };
        return result;
    };

    this.makeHooks = function(ServiceObj, instance){
        var me = this;

        // validation
        if(ServiceObj == null || ServiceObj.prototype == null){
            var err = new Error("no service object or empty prototype");
            throw err;
        }
        if(instance == null){
            var err = new Error("no service instance provided");
            throw err;
        }

        // create hooks
        for(var property in ServiceObj.prototype){
            (function(property){
                // unique hook name
                var jobKey = me.serviceName + '.' + property;

                // create hook
                me.jobsClient.process( jobKey, function(job, cb){
                    instance[property] (job.data, cb);
                });
            })(property);
        }
    };

    this._parseArguments = function(){
        // get all keys in arguments, etc
        var data = {};
        var keys = [];
        for(var key in arguments) {
            data[key] = arguments[key];
            keys.push(key);
        }
        var optionIdx = keys.pop();
        var cbIdx = keys.pop();

        // parse arguments
        var cb;
        var options = arguments[optionIdx];
        if (typeof(options) == 'function') {
            cb = options;
            options = {};
            delete data[optionIdx];
        } else {
            cb = arguments[cbIdx];
            if (typeof(cb) != 'function') {
                cb = function() {}; // does nothing
            }else{
                delete data[cbIdx];
            }
        }

        // return values
        return {
            data: data,
            options: options,
            callback: cb
        };
    };

    this._fireJob = function(jobKey, data, options, cb){
        var me = this;

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

}).call(KueMicroservice.prototype);

module.exports = KueMicroservice;

