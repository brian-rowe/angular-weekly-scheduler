var webpackConfig = require('./webpack.config');

module.exports = function (config) {
  config.set({

    files: [
      'dist/angular-weekly-scheduler.js',
      'test/spec/**/*.ts'
    ],

    autoWatch: true,

    frameworks: ['jasmine', 'karma-typescript'],

    browsers: [
      'Chrome'
    ],

    plugins: [
      'karma-typescript',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    preprocessors: {
      'test/spec/**/*.ts': 'karma-typescript'
    },

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    tsconfig: './tsconfig.json',
    webpackConfig: webpackConfig
  });
};
