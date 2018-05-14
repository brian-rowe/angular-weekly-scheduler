var gulp = require("gulp"),
    clean = require("gulp-clean"),
    cleanCSS = require("gulp-clean-css"),
    concat = require("gulp-concat"),
    htmlmin = require("gulp-htmlmin"),
    less = require("gulp-less"),
    merge = require('merge2'),
    runSequence = require("run-sequence"),
    sourcemaps = require("gulp-sourcemaps"),
    sort = require("gulp-sort"),
    templateCache = require("gulp-angular-templatecache"),
    ts = require("gulp-typescript"),
    minify = require("gulp-minify"),
    increment = require("gulp-increment-version"),
    watch = require("gulp-watch"),
    webserver = require("gulp-webserver");

var srcFolder = 'app';
var distFolder = 'dist';
var testFolder = 'test';

var compiledJavascriptFilename = 'ng-weekly-scheduler.js';
var compiledJavascriptPath = distFolder + '/' + compiledJavascriptFilename;

var lessGlob = srcFolder + '/**/*.less';

var templateGlob = srcFolder + '/**/*.html';
var templateModuleFilename = 'templates.js';
var templateModulePath = distFolder + '/' + templateModuleFilename;

var typescriptGlob = srcFolder + '/**/*.ts';

gulp.task("default", ["build"]);

/*--------------------- Build ---------------------*/
gulp.task("build", function () {
    return runSequence(
        "devbuild",
        "incrementVersion"
    );
});

gulp.task("devbuild", function () {
    return runSequence(
        "clean",
        "buildCSS",
        "buildJS",
        "buildTemplateCache",
        "concat",
        "copyTestFiles",
        "minify"
    );
});

gulp.task("clean", function () {
    return gulp.src(distFolder, {
        read: false
    }).pipe(clean());
});

gulp.task("buildJS", function () {
    var tsProject = ts.createProject("tsconfig.json");

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init({ largeFile: true }))
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest(distFolder)),
        tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest(distFolder))
    ]);
});

gulp.task("buildTemplateCache", function () {
    return gulp
        .src(templateGlob)
        .pipe(sort())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(templateCache(templateModuleFilename, {
            module: 'ngWeeklySchedulerTemplates',
            standalone: true
        }))
        .pipe(gulp.dest(distFolder));
});

gulp.task("concat", function () {
    return gulp
        .src([compiledJavascriptPath, templateModulePath])
        .pipe(concat(compiledJavascriptFilename))
        .pipe(gulp.dest(distFolder));
});

gulp.task("minify", function () {
    return gulp.src(compiledJavascriptPath)
        .pipe(minify({
            ext: {
                src: ".js",
                min: ".min.js"
            }
        }))
        .pipe(gulp.dest(distFolder));
});

gulp.task("buildCSS", function () {
    return gulp.src(lessGlob)
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(gulp.dest(distFolder))
});

gulp.task("incrementVersion", function () {
    increment.config({
        "push-tag": false
    });

    return increment.task();
});

gulp.task("server", function () {
    return gulp
        .src(testFolder)
        .pipe(webserver({
            port: "8081",
            livereload: true,
            open: true
        }));
});

gulp.task('start', function () {
    return runSequence('server', ['watchCSS', 'watchTS', 'watchTemplates']);
});

gulp.task('copyTestCSS', function () {
    return gulp.src([
        "dist/ng-weekly-scheduler.css"
    ])
        .pipe(concat('testStyles.css'))
        .pipe(gulp.dest(testFolder));
});

gulp.task('copyTestJS', function () {
    return gulp.src([compiledJavascriptPath])
        .pipe(concat('testScripts.js'))
        .pipe(gulp.dest(testFolder));
});

gulp.task('copyTestFiles', ['copyTestCSS', 'copyTestJS'], function () {
    let vendorJavascript = gulp.src([
        'angular/angular.js',
        'angular-mocks/angular-mocks.js',
        'angular-animate/angular-animate.js',
        'angular-dynamic-locale/dist/tmhDynamicLocale.js',
        'moment/moment.js',
        'moment-duration-format/lib/moment-duration-format.js'
    ],
    {
        cwd: 'node_modules'
    })
    .pipe(concat('testVendorScripts.js'));

    let indexPage = gulp.src(srcFolder + '/index.html');

    return merge([vendorJavascript, indexPage]).pipe(gulp.dest(testFolder));
});

gulp.task('watchCSS', function () {
    gulp.watch(lessGlob, function () { runSequence('buildCSS', 'copyTestCSS'); });
});

gulp.task('watchTS', function () {
    gulp.watch(typescriptGlob, function () { runSequence('buildJS', 'concat', 'copyTestJS'); });
});

gulp.task('watchTemplates', function () {
    gulp.watch(templateGlob, function () { runSequence('buildTemplateCache', 'concat', 'copyTestJS'); });
});