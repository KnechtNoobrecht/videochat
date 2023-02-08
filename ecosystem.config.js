module.exports = {
  apps: [{
    name: "Video-Stream-Server-DEV",
    script: "./server.js",
    watch: false,
    env_development: {
      "NODE_ENV": "development",
      "PORT": 6001
    },
    env_production: {
      "NODE_ENV": "production",
      "PORT": 6565
    }
  }]
}