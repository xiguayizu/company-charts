var gulp     = require('gulp'),
    concat   = require('gulp-concat'),//- 多个文件合并为一个；  
    cleanCSS = require('gulp-clean-css'),//- 压缩CSS为一行；  
    ugLify   = require('gulp-uglify'),//压缩js  
    imageMin = require('gulp-imagemin'),//压缩图片  
    pngquant = require('imagemin-pngquant'), // 深度压缩  
    htmlMin  = require('gulp-htmlmin'),//压缩html  
    changed  = require('gulp-changed'),//检查改变状态  
    less     = require('gulp-less'), //压缩合并less  
    del      = require('del'),
    browserSync = require("browser-sync").create();//浏览器实时刷新 

//删除dist下的所有文件  
gulp.task('delete',function(cb){  
    return del(['dist/*','!dist/images'],cb);  
});

//压缩js  
gulp.task("script",function(){  
    gulp.src([	"js/absPainter.js",
    			"js/ajax.js",
	    		"js/axis-x.js",
	    		"js/axis-y.js",
	    		"js/chartEventHelper.kl.js",
	    		"js/controller.js",
	    		"js/crossLines.js",
	    		"js/linepainter.js",
	    		"js/loading.js",
	    		"js/tip.js",
	    		"js/util.js",
	    		"js/volumePainter.js", 
	    		"js2/chartEventHelper.js", 
	    		"js/k-data.js",
	    		"js/store.js",
	    		"js2/fsdraw.js"]);
        .pipe(changed('dist/js', {hasChanged: changed.compareSha1Digest}))  
        .pipe(concat('index.js'))  
        .pipe(ugLify())  
        .pipe(gulp.dest('dist/js'))  
        .pipe(browserSync.reload({stream:true}));  
}); 

//实时编译less  
gulp.task('css', function () {  
    gulp.src(['./css/*.css']) //多个文件以数组形式传入  
        .pipe(concat('store.css'))//合并之后生成main.css  
        .pipe(cleanCSS())//压缩新生成的css  
        .pipe(gulp.dest('dist/css'))//将会在css下生成main.css  
        .pipe(browserSync.reload({stream:true}));  
});  

gulp.task('default', function() {
	
	console.log("test");

    gulp.start('script','css');  
    // gulp.watch('src/js/*.js', ['script']);         //监控文件变化，自动更新  
    // gulp.watch('src/css/*.css', ['css']);  

});