"use strict";

module.exports = {
  apps: [{
    name: "NodeJS Peer Signal Server",
    script: "./server.js",
    watch: true,
    ignore_watch: ['node_modules']
  }]
};