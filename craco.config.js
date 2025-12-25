module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find and configure source-map-loader to ignore node_modules
      const rules = webpackConfig.module.rules;
      const sourceMapLoaderRule = rules.find(
        (rule) =>
          rule.enforce === 'pre' &&
          (rule.loader?.includes('source-map-loader') ||
           rule.use?.some?.((use) => use.loader?.includes('source-map-loader')))
      );

      if (sourceMapLoaderRule) {
        // Exclude node_modules from source-map-loader
        sourceMapLoaderRule.exclude = /node_modules/;
      }

      return webpackConfig;
    },
  },
};

