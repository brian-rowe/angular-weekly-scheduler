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

var distFolder = 'dist';
var testFolder = 'test';

var compiledJavascriptFilename = 'ng-weekly-scheduler.js';
var compiledJavascriptPath = distFolder + '/' + compiledJavascriptFilename;

var lessGlob = 'app/**/*.less';

var templateModuleFilename = 'templates.js';
var templateModulePath = distFolder + '/' + templateModuleFilename;

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
        "copyHtml",
        "concat",
        "copyTestFiles",
        "minify",
        "cleanDist"
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
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest(distFolder)),
        tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest(distFolder))
    ]);
});

gulp.task("copyHtml", function () {
    return gulp
        .src("./app/**/*.html")
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

gulp.task("cleanDist", function () {
    return gulp
        .src(templateModulePath)
        .pipe(clean());
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
    return runSequence('server', 'watchCSS');
});

gulp.task('copyTestFiles', function () {
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

    // Locale files need to be separate
    let vendorLocales = gulp.src([
        'angular-i18n/angular-locale_en-us.js',
        'angular-i18n/angular-locale_en-gb.js',
        'angular-i18n/angular-locale_fr-fr.js',
        'angular-i18n/angular-locale_de-de.js',
        'angular-i18n/angular-locale_es-es.js' 
    ], { cwd: 'node_modules' });

    let indexPage = gulp.src('app/index.html');

    let casJavascript = gulp.src([compiledJavascriptPath])
        .pipe(concat('testScripts.js'))
        .pipe(gulp.dest(testFolder));

    let styles = gulp.src([
        "dist/ng-weekly-scheduler.css"
    ])
    .pipe(concat('testStyles.css'))

    return merge([vendorJavascript, vendorLocales, indexPage, casJavascript, styles]).pipe(gulp.dest(testFolder));
});

gulp.task('watchCSS', function() {
    gulp.watch(lessGlob, function() { runSequence('buildCSS', 'copyTestFiles'); });
});