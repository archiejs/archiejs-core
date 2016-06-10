var ServiceObj = function(config, imports, done){
    this.value = 0;
    this.comments = [];
    done();
};

(function(){
    this.add = function(num, str){
        this.value += num ;
        this.commend.push(str);
    };

    this.sub = function(num, str){
        this.value -= num ;
        this.commend.push(str);
    };

    this.mult = function(num, str){
        this.value += num ;
        this.commend.push(str);
    };
}).call(ServiceObj.prototype);

module.exports = ServiceObj;
