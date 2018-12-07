var gulp = require('gulp');
var screeps = require('gulp-screeps');
var credentials = require('./gulp.env.js');


gulp.task('watch', function() {
    gulp.watch('*.js', ['screeps']);
});

gulp.task('screeps', function () {
    gulp.src('*.js')
        .pipe(screeps(credentials));
});
