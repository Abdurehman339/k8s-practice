module.exports = {
  apps: [
    {
      name: 'Backend Equine Directory',
      script: 'dist/main.js', // Ensure this path is correct
      instances: 'max', // Run in cluster mode
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3009,
        DATABASE_URL:
          'postgresql://abdurrehman:password@localhost:5432/equine_directory?schema=public',
      },
    },
  ],
};
