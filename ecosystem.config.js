module.exports = {
  apps: [{
    name: "Video-Stream-Server-DEV",
    script: "./server.js --inspect",
    watch: ["server.js"],
    // Delay between restart
    watch_delay: 5000,
    ignore_watch: ["node_modules", "public"],
    env: {
      "NODE_ENV": "development",
      "PORT": 6001
    }
  },
  {
    name: "Video-Stream-Server",
    script: "./server.js",
    watch: false,
    env: {
      "NODE_ENV": "development",
      "PORT": 6001
    }
  }]
}