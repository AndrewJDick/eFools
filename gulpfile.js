// Gulp Plugins
var gulp          = require('gulp'),
    rename        = require("gulp-rename"),
    imgmin        = require('gulp-imagemin'),
    plumber       = require('gulp-plumber'),
    emailBuilder  = require('gulp-email-builder'),
    replace       = require('gulp-replace'),
    entityconvert = require('gulp-entity-convert'),
    htmlmin       = require('gulp-htmlmin'),
    zip           = require('gulp-zip'),
    htmllint      = require('gulp-htmllint'),
    gutil         = require('gulp-util');


// Global Variables
var emailSubject  = 'Cohaesus Easter Email';


// Shortcut paths to locate html and img files
var paths = {
  html: ['./*.html'],
  img: ['./src/img/*']
};


// Litmus Task
// Running the task sources all html files in the project folder on the approval server and sends a test to the VML Litmus account (available here: https://litmus.com/checklist).
gulp.task('litmusTest', function() {
    gulp.src(['./index.html'])
    .pipe(emailBuilder( {

        litmus : {
            subject:    emailSubject,
            username:   '',
            password:   '',
            url:        '',

            // Email clients. <application_code> found at http://yoursite.litmus.com/emails/clients.xml
            applications : ['android4', 'androidgmailapp', 'gmailnew', 'ffgmailnew', 'chromegmailnew', 'ipadmini', 'ipad' , 'iphone5s', 'iphone5sios8', 'iphone6', 'iphone6plus', 'iphone6s', 'iphone6splus', 'ol2000', 'ol2002', 'ol2003', 'ol2007', 'ol2010', 'ol2011', 'ol2013', 'ol2013dpi120', 'ol2015', 'outlookcom', 'ffoutlookcom', 'chromeoutlookcom', 'yahoo', 'ffyahoo', 'chromeyahoo']
        }
    }))
});


// Linting Task
gulp.task('lint', function() {
    return gulp.src('./index.html')
        .pipe(htmllint({}, htmllintReporter));
});
 
function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(function (issue) {
            gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
        });
 
        process.exitCode = 1;
    }
}


// HTML Dist code
// Removes whitespace and comments from the code, minifies it, and pipes it to dist.
gulp.task('distHTML', function() {
    return gulp.src('./index.html')
    .pipe(htmlmin( {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true
    }))
    .pipe(rename({ extname: '.min.html' }))
    .pipe(gulp.dest('dist/'))
});


// Image Optimisation Task
// Publishes compressed image files from Src to Dist.
gulp.task('distImg', function() {

    // Compress Image files to reduce file size
    gulp.src(['./src/img/*.jpg', './src/img/*.gif', './src/img/*.png'])

        .pipe(imgmin({
            // jpg
            progressive: true,

            // gif
            interlaced: true,

            // png
            optimizationLevel: 3
        }))

        // Output to Dist
        .pipe(gulp.dest('./dist/img/'));
});


// Campaign Monitor Task
// Zips the image files for importing into Campaign Monitor
gulp.task('cmZip', function() {
    return gulp.src(['./src/img/*.jpg', './src/img/*.gif', './src/img/*.png'])

        .pipe(zip('img.zip'))
        .pipe(gulp.dest('./dist/' + 'campaign_monitor/'));
});


// Watch Task
// ToDo: Search for Gulp 'delay' task', to ensure dist files are complete before the next task executes.
// Looks for any changes to the html and img files in src, then recompiles the respective files in dist.
gulp.task('watch', function() {
  gulp.watch(paths.html, ['distHTML']);
  gulp.watch(paths.img, ['distImg', 'cmZip'])
});


// Default Task
gulp.task('default');

