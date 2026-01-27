module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix CSS ordering conflicts with code splitting
      const miniCssExtractPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
      );
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true;
      }
      return webpackConfig;
    },
  },
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