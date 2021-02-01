module.exports = function(config) {
  config.set({
    basePath: '../../../',
    singleRun: true,
    autoWatch: false,
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      require('./preprocessor')
    ],
    frameworks: ['mocha', 'chai'],
    files: [
      'axe.js',
      'test/integration/act/*.json',
      {
        pattern: 'node_modules/act-rules.github.io/test-assets/**/*',
        included: false,
        served: true
      }
    ],
    browsers: ['ChromeHeadless'],
    reporters: ['mocha'],
    preprocessors: {
      '**/*.json': ['act']
    },
    client: {
      useIframe: false,
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
