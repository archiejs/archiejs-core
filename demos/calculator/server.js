#!/usr/bin/env node

var path = require('path');
var archie = require("archie");

var configPath = path.join(__dirname, "config.js");
var config = archie.loadConfig(configPath);

archie.createApp(config, function (err, app) {
  if (err) throw err;
  console.log("app ready");
});
