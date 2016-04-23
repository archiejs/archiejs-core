/*
 * A enhancer manager - maps names of enhancers in package.json's to
 * implementation.
 */

var DEBUG = false;

// Maps enhancer name -> factory function
var enhancerFactory = {
};

module.exports.registerEnhancerFactory = function(name, factoryFn){
    if(enhancerFactory[name]){
        console.warn("WARNING! You are overwriting a enhancer that is already registered with Archie module");
        console.warn("  Enhancer Name : " + name);
        if(DEBUG) console.trace();
    }

    enhancerFactory[name] = factoryFn;
};

module.exports.newEnhancer = function(name){
    if(enhancerFactory[name]){
        return enhancerFactory[name]();
    }else{
        console.warn("WARINING! Unable to create " + name + " enhancer - it is not registered.");
    }
};
