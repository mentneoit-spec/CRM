module.exports = {
  apps: [
    {
      name: 'college-erp',
      script: './index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for load balancing
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000,
      },
      
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Performance
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      autorestart: true,
      watch: false, // Disable in production
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // Advanced features
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      
      // Monitoring
      instance_var: 'INSTANCE_ID',
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Source map support
      source_map_support: true,
      
      // Graceful shutdown
      shutdown_with_message: true,
    },
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:yourorg/college-erp.git',
      path: '/home/ubuntu/college-erp',
      'post-deploy': 'npm install && npx prisma migrate deploy && npx prisma generate && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production..."',
      'post-deploy-local': 'echo "Deployment complete!"',
    },
    staging: {
      user: 'ubuntu',
      host: ['your-staging-server-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:yourorg/college-erp.git',
      path: '/home/ubuntu/college-erp-staging',
      'post-deploy': 'npm install && npx prisma migrate deploy && npx prisma generate && pm2 reload ecosystem.config.js --env staging',
    },
  },
};
