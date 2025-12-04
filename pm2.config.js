module.exports = {
  apps: [
    {
      name: "bm-app-backend",
      script: "dist/server.js",
      instances: 1,
      env_production: {
        ...require("./secrets.json"),
        NODE_ENV: "production",
      },
      watch: true,
      instances: 1, // Number of instances to run, adjust as needed
      exec_mode: "fork",
    },
  ],
};

