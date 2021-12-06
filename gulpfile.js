const gulp = require('gulp'),
    pug = require('gulp-pug'),
    less = require('gulp-less')
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    tap = require('gulp-tap');

browserSync = require('browser-sync');

/**
 * pug compiler
 */
 gulp.task('pug', async function() {
  return gulp.src('lib/**/*.pug')
   .pipe(pug())
   .pipe(gulp.dest('dist'));
})

/**
 * less compiler
 */
gulp.task('less', function(){
    return gulp.src('lib/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}))
});

/* 
* browserify task
*/
gulp.task('browserify', function() {
  return gulp.src('lib/js/*.js', {read:false})

	// transform file objects with gulp-tap
	.pipe(tap((h_file) => {
	  // browserify
		h_file.contents = browserify({
			entries: [h_file.path],
			debug: true,
		}).bundle();
	}))
	// transform streaming contents into buffer contents
	.pipe(buffer())

	// output
	.pipe(gulp.dest('dist/js'));
});

// Called when 'gulp' is run
gulp.task('default',gulp.series('pug', 'less', 'browserify'));
