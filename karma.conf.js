var webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({
    files: [
      'test/module.ts'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: [
      'Chrome'
    ],

    preprocessors: {
      'test/**/*.ts': ['webpack']
    },

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    tsconfig: './tsconfig.json',
    webpack: webpackConfig
  });
};
