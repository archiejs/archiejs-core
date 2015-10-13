'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    age: Number
});

module.exports = mongoose.model('Schema', schema);
