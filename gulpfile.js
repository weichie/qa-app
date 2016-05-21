var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

gulp.task('default', function() {
  // place code for your default task here
  return gulp.src('public/sass/*.scss')
    .pipe(watch('public/sass/*.scss'))
    .pipe(sass())
    .pipe(gulp.dest('dist'));
});