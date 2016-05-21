// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var reload = require('reload');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

// Reload delay
var BROWSER_SYNC_RELOAD_DELAY = 1000;

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

gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 4000
    });
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

    // * 'views/*.ejs', 'public/javascripts/qa-app.js' */
    gulp.watch('public/javascripts/*.js', ['lint', 'bs-reload']);
    gulp.watch('public/sass/*.scss', ['sass', 'bs-reload']);
    gulp.watch('views/*.ejs', ['bs-reload']);
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

// Default Task
gulp.task('default', ['lint', 'sass', 'watch']);

// Nodemonnnnn
/*gulp.task('nodemon', function (cb) {
    var callbackCalled = false;
    return nodemon({script: './bin/www'}).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            cb();
        }
    });
});*/
var nodemonOptions = {
    script: 'bin/www',
    ext: 'js,ejs',
    env: { 'NODE_ENV': 'development' },
    verbose: false,
    ignore: [],
    watch: ['bin/*', 'routes/*', 'app.js']
};

gulp.task('start', ['browser-sync', 'watch'], function(){
    nodemon(nodemonOptions)
        .on('restart', function(){
            console.log('restarted!');

             setTimeout(function reload() {
                browserSync.reload({
                  stream: false
                });
              }, BROWSER_SYNC_RELOAD_DELAY);
        });
})

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