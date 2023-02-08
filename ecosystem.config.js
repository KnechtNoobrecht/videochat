module.exports = {
  apps: [{
    name: "Video-Stream-Server-DEV",
    script: "./server.js",
    watch: ["server.js"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch: ["node_modules", "public"],
    env_development: {
      "NODE_ENV": "development",
      "PORT": 6001
    }
  },
  {
    name: "Video-Stream-Server",
    script: "./server.js",
    watch: false,
    env: {
      "NODE_ENV": "production",
      "PORT": 6000
    }
  }]
}