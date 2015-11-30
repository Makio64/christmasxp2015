var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
/*
https://github.com/twolfson/gulp.spritesmith
*/
gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img.sprite.src/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: 'sprite.styl',
    cssFormat: 'stylus'
  }));
  
  //spriteData.pipe(gulp.dest('static/images/'));
	spriteData.img.pipe(gulp.dest('static/images/')); // output path for the sprite
    spriteData.css.pipe(gulp.dest('src/stylus/')); // output path for the CSS

});