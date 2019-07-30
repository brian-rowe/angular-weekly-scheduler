var gulp = require("gulp"),
    increment = require("gulp-increment-version"),
    webserver = require("gulp-webserver");

var demoFolder = 'demo';

gulp.task("default", ["server"]);

gulp.task("incrementVersion", function () {
    increment.config({
        "push-tag": false
    });

    return increment.task();
});

gulp.task("server", function () {
    return gulp
        .src(demoFolder)
        .pipe(webserver({
            port: "8081",
            livereload: true,
            open: true
        }));
});