var gulp = require('gulp'),
    gulp_clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require("gulp-sourcemaps");


var folder = {
    src: 'src',
    dist: 'dist'
};

var khoaiScripts = [
    'src/khoai.js',
    'src/util.js'
];

gulp.task('clean-dist-folder', function () {
    return gulp.src(folder.dist, {read: false})
        .pipe(gulp_clean());
});

gulp.task('khoai_js__concat', ['clean-dist-folder'], function () {
    return gulp.src(khoaiScripts)
        .pipe(sourcemaps.init())
        .pipe(concat('khoai.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(folder.dist));
});

gulp.task('khoai_js__uglify', ['khoai_js__concat'], function () {

    return gulp.src(folder.dist + '/khoai.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(folder.dist));
});

gulp.task('khoai_js', ['khoai_js__concat', 'khoai_js__uglify']);
gulp.task('default', ['khoai_js']);