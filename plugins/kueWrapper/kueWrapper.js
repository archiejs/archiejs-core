'use strict';

var kue = require('kue');

module.exports = function(options, imports, register){
    var resisMicroservice = new RedisMicroservice(options, imports);
    register(null, {
        "archie-kueredis-mircoservice": redisMicroservice
    });
};

var RedisMicroservice = function(options, imports) {
    // nothing to do really
    var serviceName = options.serviceName;
    var config = options.redisConfig;
    this.jobsClient = kue.createClient({
        prefix: config.prefix,
        redis: {
            host: config.host,
            port: config.port,
            user: config.username,
            pass: config.password
        }
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
        for(var property in ServiceObj){
            (function(property){
                result[property] = function(){
                    // unique service name
                    var jobKey = serviceName + '.' + property;

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
        var result = Object.create({});
        for(var property in ServiceObj){
            (function(property){
                result[property] = function(){
                    // unique hook name
                    var jobKey = serviceName + '.' + property;

                    // create hook
                    me.jobsClient.process( jobKey, function(job, cb){
                        instance[jobKey] (job.data, cb);
                    });
                };
            })(property);
        }
    };

    this._parseArguments = function(){
        var cb; 
        var options = arguments.pop();
        if (typeof(options) == 'function') {
            cb = options;
            options = {};
        } else {
            cb = arguments.pop();
            if (typeof(cb) != 'function') {
                cb = function() {}; // does nothing
            }
        }
        var data = arguments;
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
        if(p.options.priority){
            job.priority(options.priority);
        }
        if(p.options.attempts){
            job.priority(options.attempts);
        }

        // fire the job
        job.save(function(err){
            if(err){
                return cb(err);
            }
        })
        .on('failed', function(err){
            return cb(err);
        })
        .on('complete', function(result){
            return cb(null, result);
        });

        // return to user to update any options
        return job;
    };

}).call(RedisMicroservice.prototype);

