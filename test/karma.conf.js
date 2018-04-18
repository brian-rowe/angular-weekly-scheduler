module.exports = function (config) {
  config.set({

    basePath: '../',

    files: [
      'test/testVendorScripts.js',
      'dist/ng-weekly-scheduler.js',
      'test/spec/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: [
      'PhantomJS'
    ],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
  });
};
