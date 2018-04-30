module.exports = function (config) {
  config.set({

    files: [
      'test/testVendorScripts.js',
      'dist/ng-weekly-scheduler.js',
      'test/spec/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: [
      'Chrome'
    ],

    plugins: [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
};
