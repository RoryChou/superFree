/**
 * Created by rory on 2017/3/8.
 */
const gulp = require('gulp'),
      Path = require('path'),
      sass = require('gulp-sass'),
      gulpIf = require('gulp-if'),
      uglify = require('gulp-uglify'),
      clean = require('gulp-clean'),
      replace = require('gulp-replace'),
      htmlReplace = require('gulp-html-replace'),
      cleanCss = require('gulp-clean-css'),
      spriter = require('gulp-css-spriter'),
      prefix = require("gulp-prefix"),
      browserSync = require('browser-sync').create(),
      reload = browserSync.reload,
      autoprefixer = require("gulp-autoprefixer"),
      rev = require('gulp-rev'),
      collector = require('gulp-rev-collector');

let htmlNameArr = ['lvcc','BrandCooperation'],
    htmlName = 'home',//
    htmlNameAll = '*',//
    htmlSvn = 'test',
    cssSvn = 'test',
    jsSvn = 'test',
    imgsSvn = 'test',
    img = 'http://pic.lvmama.com/img/lvcc/',
    css = 'http://pic.lvmama.com/styles/lvcc/',
    js = 'http://pic.lvmama.com/js/lvcc/',
    folderName = 'http://pic.lvmama.com/styles/zt/9years',
    shouldSprite = false,
    shouldMd5 = false,
    shouldUglify = true,
    shouldPrefix = false,
    obj = {
        domains:['s1.lvjs.com.cn','s2.lvjs.com.cn','s3.lvjs.com.cn','pic.lvmama.com'],
        protocol:'http://'
    };

// 静态服务器 + 监听 scss/html/js/imgs 文件
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: {
            baseDir: "./src",
            index: htmlName+".html"
        }
    });
    gulp.watch("src/scss/*.scss", ['sass']);
    gulp.watch("src/*.html").on('change', reload);
    gulp.watch("src/js/*.js").on('change', reload);
    gulp.watch("src/imgs/*").on('change', reload);
});

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function() {
    return gulp.src("src/scss/*.scss")
        .pipe(sass({outputStyle:'compact'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest("src/css"))
        .pipe(reload({stream: true}));
});

//dist-js，压缩
gulp.task('dist-js',function () {
    gulp.src('dist/js/*.js', {read: false})
        .pipe(clean());
    return gulp.src('src/js/*.js')
        .pipe(gulpIf(shouldUglify,uglify()))
        .pipe(gulpIf(shouldMd5,rev()))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulpIf(shouldMd5,rev.manifest()))
        .pipe(gulpIf(shouldMd5,gulp.dest('rev/js')));
});

//dist-imgs
gulp.task('dist-img',['dist-css'],function () {
    gulp.src('dist/imgs/*', {read: false})
        .pipe(clean());
    return gulp.src(['src/imgs/*','src/imgs/*/*','!src/imgs/psd','!src/imgs/psd/*','!src/imgs/sprite','!src/imgs/sprite/*'])
        .pipe(gulp.dest('dist/imgs'));
});

//判断是否需要雪碧图
gulp.task('checkSprite',function () {
    gulp.src('src/imgs/sprite/*')
        .on('data',function (file) {
            file ? shouldSprite = true:shouldSprite = false;
        })
});

//dist-css,生成雪碧图,压缩
gulp.task('dist-css',['sass','checkSprite'],function () {
    gulp.src('dist/css/*.css', {read: false})
        .pipe(clean());
    return gulp.src('src/css/*.css')
        .pipe(gulpIf(shouldSprite,spriter({
            'spriteSheet': './src/imgs/spritesheet.png',
            'pathToSpriteSheetFromCSS': '../imgs/spritesheet.png',
            'includeMode':'explicit'
        })))
        .pipe(cleanCss({
            compatibility:'ie7',
            format:{
                breaks:{
                    afterRuleEnds: true
                }
            }
        }))
        .pipe(gulpIf(shouldMd5,rev()))
        .pipe(gulp.dest('dist/css'))
        .pipe(gulpIf(shouldMd5,rev.manifest()))
        .pipe(gulpIf(shouldMd5,gulp.dest('rev/css')));
});

//dist-html
gulp.task('dest-html',function () {
    gulp.src('src/'+htmlName+'.html')
        .pipe(gulpIf(shouldPrefix,prefix(folderName,null,'{{')))
        //替换lazyload中的图片路径
        .pipe(gulpIf(shouldPrefix,replace('data-original="imgs/','data-original="'+folderName+'/imgs/')))
        .pipe(gulp.dest('dist'));
});

//dest-dist
gulp.task('dist',['dist-js','dist-img','dist-css','dest-html'],function () {
    if(shouldMd5){
        return gulp.src(['rev/**/*.json','dist/'+htmlName+'.html'])
            .pipe(collector({
                replaceReved: true,
                dirReplacements: {
                    'css': 'css',
                    'js': 'js'
                }
            }))
            .pipe(gulp.dest('dist'))
    }else {
        return gulp.src('dist/*');
    }
});

//css相对路径替换绝对路径
gulp.task('cssReplace',['dist'],function () {
    return gulp.src('dist/css/*.css')
             .pipe(replace(/\.\.\/imgs/g,img))
             .pipe(gulp.dest('dist/css'));
});

//html相对路径替换绝对路径
gulp.task('urlReplace',['dist'],function () {
    return gulp.src('dist/'+htmlName+'.html')
            .pipe(replace(/imgs\//g,img))
            .pipe(replace(/\=\"css\//g,'="'+css))
            .pipe(replace(/\=\"js\//g,'="'+js))
             .pipe(gulp.dest('dist'))
});

//获取资源路径
gulp.task('getUrl',['urlReplace'],function () {
    return gulp.src('dist/'+htmlName+'.html')
        .on('data',function (file) {
        let fileName = file.relative;
            obj[fileName] = {};
            obj[fileName].css = [];
            obj[fileName].js = [];
        let string = JSON.stringify(file.contents.toString('utf-8')),
            regexpComment = /(\n?)([ \t]*)(<!--\s*build:(\w+(?:-\w+)*)\s*-->)\n?([\s\S]*?)\n?(<!--\s*endbuild\s*-->)\n?/ig,
            regexpHref = /href\s*=\s*\\"(.*)\\"\s*\/*>/i,
            regexpSrc = /src\s*=\s*\\"(.*)\\"\s*>/i,
            regexpMin = /index\.php\?f=(.*)$/i,
            regexpIndex = /pic\.lvmama\.com(.*)$/i,
            commentArr = string.match(regexpComment);//获取所有此注释的片段数组

        //遍历数组,判断build:的标识，并保存
        for(let i in commentArr){
            let line = commentArr[i].split('\\r\\n');
            for(let j=1;j < line.length-1;j++){
                if(line[0].match('css')){
                    let res = line[j].match(regexpHref);
                    res[1].match(regexpMin)?obj[fileName].css.push(res[1].match(regexpMin)[1]):obj[fileName].css.push(res[1].match(regexpIndex)[1]);
                }else if(line[0].match('js')){
                    let res = line[j].match(regexpSrc);
                    res[1].match(regexpMin)?obj[fileName].js.push(res[1].match(regexpMin)[1]):obj[fileName].js.push(res[1].match(regexpIndex)[1]);
                }else {
                    console.log('error')
                }
            }
        }
    })
});

//html路径合并
gulp.task('urlConcat',['getUrl'],function () {
    return gulp.src('dist/'+htmlName+'.html')
            .pipe(htmlReplace({
                'css':'<link rel="stylesheet" href="'+ obj.protocol +obj.domains[Math.floor(Math.random()*4)] + '/min/index.php?f=' + obj[fileName].css.join(',') +'">',
                'js':'<script src="'+ obj.protocol +obj.domains[Math.floor(Math.random()*4)] + '/min/index.php?f=' + obj[fileName].js.join(',') +'"></script>'
            }))
            .pipe(gulp.dest('dist'))
});

//svn
gulp.task('dest-svn',['urlConcat','cssReplace'],function () {
    gulp.src('dist/js/*.js')
        .pipe(gulp.dest(jsSvn));
    gulp.src('dist/css/*.css')
        .pipe(gulp.dest(cssSvn));
    gulp.src('dist/imgs/*')
        .pipe(gulp.dest(imgsSvn));
    gulp.src('dist/'+htmlName+'.html')
        .pipe(gulp.dest(htmlSvn));
});

gulp.task('test',function () {
    gulp.src('src/css/*.css')
        .pipe(spriter({
            'spriteSheet': './src/imgs/spritesheet.png',
            'pathToSpriteSheetFromCSS': '../imgs/spritesheet.png',
            'includeMode':'explicit'
        }))
        .pipe(gulp.dest('test'))
});
