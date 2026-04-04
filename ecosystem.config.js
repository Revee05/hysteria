module.exports = {
  apps: [
    {
      name: "hysteria",
      script: ".next/standalone/server.js",
      cwd: "/var/www/hysteria",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
