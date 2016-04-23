var ServiceObj = function(){
    this.func1_count = 0;
    this.func2_count = 0;
    this.func3_count = 0;
};

(function(){
    this.func1 = function(){
        this.func1_count++;
    };

    this.func2 = function(){
        this.func2_count++;
    };
    
    this.func3 = function(){
        this.func3_count++;
    };
}).call(ServiceObj.prototype);

module.exports = ServiceObj;
