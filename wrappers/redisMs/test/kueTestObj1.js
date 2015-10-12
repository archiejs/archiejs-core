
var ServiceObj = function(){
    this.func1_count = 0;
    this.func2_count = 0;
    this.func3_count = 0;
};

(function(){
    this.func1 = function(done){
        this.func1_count++;
        done();
    };

    this.func2 = function(done){
        this.func2_count = 1;
        done();
    };

    this.func3 = function(done){
        this.func3_count = 1;
        done();
    };
}).call(ServiceObj.prototype);

module.exports = ServiceObj;
