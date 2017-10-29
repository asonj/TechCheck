var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var babel = require('gulp-babel');

gulp.task('set-dev',function(){
  return process.env.NODE_ENV = 'development';
})
gulp.task('set-prod',function(){
  return process.env.NODE_ENV = 'production';
})

//PRODUCTION 


gulp.task('minify-css', function() {
    return gulp.src('dev/css/**/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('uglify-js', function(){
  return gulp.src(['dev/js/*.js', '!dev/js/sorttable.js'])
    .pipe(babel({
            presets: ['env']
        }))
    .pipe(uglify())
     .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('dist/js/'))
});

gulp.task('image-min', function(){
  return gulp.src('dev/assets/**/*.+(png|PNG|jpg|gif|svg|jpeg)')
  .pipe(cache(imagemin(
    imagemin.svgo({plugins: [{removeViewBox: true}]}))
  ))
  .pipe(gulp.dest('dist/assets'))
});

gulp.task("copy-files", function(){
  return gulp.src("dev/src/*")
  .pipe(gulp.dest("dist/src"))
})

gulp.task('build', ['set-prod', 'sass','minify-css', 'uglify-js','image-min', 'copy-files'], function(){
  
})
gulp.task('watch-production', ['set-prod', 'browserSync', 'sass'], function(){
  gulp.watch('dev/scss/**/*.scss', ['sass']); 
  gulp.watch('dev/js/*.js', browserSync.reload); 
  gulp.watch('views/*', browserSync.reload); 
});
//end PRODUCTION


gulp.task('sass', function() {
  return gulp.src('dev/scss/**/*.scss') 
    .pipe(plumber())
    .pipe(sass.sync({ // Have to use sass.sync - See Issue (https://github.com/dlmanning/gulp-sass/issues/90)
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', ['nodemon'], function() {
    browserSync.init({
        port: 8081,
        proxy: "http://localhost:8080"
    });
});


gulp.task('nodemon', function (cb) {
    var callbackCalled = false;
    return nodemon({script: 'server.js'}).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            cb();
        }
    });
});

gulp.task('watch', ['set-dev', 'browserSync', 'sass'], function(){
  gulp.watch('dev/scss/**/*.scss', ['sass']); 
  gulp.watch('dev/js/*.js', browserSync.reload); 
  gulp.watch('views/**/*.ejs', browserSync.reload); 
});


