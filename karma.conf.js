module.exports = function (config) {
  config.set({

    files: [
      'test/testVendorScripts.js',
      'dist/ng-weekly-scheduler.js',
      'test/spec/**/*.ts',
      'test/spec/**/*.js'
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
    }
  });
};
