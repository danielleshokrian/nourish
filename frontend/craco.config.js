module.exports = {
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 3000,
        protocol: 'ws',
      },
    },
    host: 'localhost',
    port: 3000,
  },
};