// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var reload = require('reload');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('public/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/stylesheets'));
});

// Concatenate & Minify JS
/* gulp.task('scripts', function() {
    return gulp.src('js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
}); */ 

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('public/javascripts/*.js', ['lint', 'scripts']);
    gulp.watch('public/sass/*.scss', ['sass']);
    gulp.watch('views/*.ejs');
});

// Default Task
gulp.task('default', ['lint', 'sass', 'watch']);



/* 
var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

gulp.task('default', function() {

  return gulp.src('public/sass/*.scss')
    .pipe(watch('public/sass/*.scss'))
    .pipe(sass())
    .pipe(gulp.dest('dist'));
}); */