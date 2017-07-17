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
      cssSprite = require('gulp-css-spritesmith'),
      prefix = require("gulp-prefix"),
      browserSync = require('browser-sync').create(),
      reload = browserSync.reload,
      autoprefixer = require("gulp-autoprefixer"),
      rev = require('gulp-rev'),
      collector = require('gulp-rev-collector');

let htmlNameArr = ['home','flight','hotel','combo','baodian','cart','form'],
    htmlName = 'form',
    htmlSvn = 'E:/svn/pages/superFree',
    cssSvn = 'E:/svn/pic/styles/superFree/'+htmlName,
    jsSvn = 'E:/svn/pic/js/superFree',
    imgsSvn = 'E:/svn/pic/img/superFree/'+htmlName,
    img = 'http://pic.lvmama.com/img/superFree/',
    css = 'http://pic.lvmama.com/styles/superFree/',
    js = 'http://pic.lvmama.com/js/superFree/',
    folderName = 'http://pic.lvmama.com/styles/zt/9years',
    shouldMd5 = false,
    shouldUglify = false,
    shouldPrefix = false,
    obj = {
        css:[],
        js:[],
        domains:['s1.lvjs.com.cn','s2.lvjs.com.cn','s3.lvjs.com.cn'],
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
    gulp.watch("src/scss/"+ htmlName +"/*.scss", ['sass']);
    gulp.watch("src/*.html").on('change', reload);
    gulp.watch("src/js/*.js").on('change', reload);
    gulp.watch("src/imgs/*").on('change', reload);
});

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function() {
    return gulp.src("src/scss/"+ htmlName +"/*.scss")
        .pipe(sass({outputStyle:'compact'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest("src/css/"+ htmlName))
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
    return gulp.src(['src/imgs/'+ htmlName +'/*','src/imgs/'+ htmlName +'/*/*','!src/imgs/psd','!src/imgs/psd/*','!src/imgs/'+ htmlName +'/sprite','!src/imgs/'+ htmlName +'/sprite/*','!src/imgs/placehold','!src/imgs/placehold/*'])
        .pipe(gulp.dest('dist/imgs/'+ htmlName));
});


//dist-css,生成雪碧图,压缩
gulp.task('dist-css',['transportCss'],function () {
    gulp.src('dist/css/'+ htmlName +'/*.css', {read: false})
        .pipe(clean());
    return gulp.src('src/css/'+ htmlName +'/*.css')
        .pipe(replace(/\.\.\/imgs\/placehold\/(.*)\.png/g,'http://via.placeholder.com/$1/ffddff'))
        .pipe(cleanCss({
            compatibility:'ie7',
            format:{
                breaks:{
                    afterRuleEnds: true
                }
            }
        }))
        .pipe(gulpIf(shouldMd5,rev()))
        .pipe(gulp.dest('dist/css/'+ htmlName))
        .pipe(gulpIf(shouldMd5,rev.manifest()))
        .pipe(gulpIf(shouldMd5,gulp.dest('rev/css')));
});


gulp.task('sprite',['sass'],function () {
    gulp.src('sprite/*', {read: false})
        .pipe(clean());
    return gulp.src('src/css/'+ htmlName +'/*.css').pipe(cssSprite({
        // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
        imagepath: 'src/imgs/'+ htmlName +'/sprite',
        // 映射CSS中背景路径，支持函数和数组，默认为 null
        imagepath_map: null,
        // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
        spritedest: 'imgs/'+ htmlName,
        // 替换后的背景路径，默认 ../images/
        spritepath: '../../imgs/'+ htmlName,
        // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
        padding: 0,
        // 是否使用 image-set 作为2x图片实现，默认不使用
        useimageset: false,
        // 是否以时间戳为文件名生成新的雪碧图文件，如果启用请注意清理之前生成的文件，默认不生成新文件
        newsprite: false,
        // 给雪碧图追加时间戳，默认不追加
        spritestamp: false,
        // 在CSS文件末尾追加时间戳，默认不追加
        cssstamp: false
    }))
        .pipe(gulp.dest('sprite'));
});

gulp.task('transportCss',['sprite'],function () {
    gulp.src('sprite/src/css/'+ htmlName +'/*.css')
        .pipe(gulp.dest('src/css/'+ htmlName));
    return gulp.src('sprite/imgs/'+ htmlName +'/*')
        .pipe(gulp.dest('src/imgs/'+htmlName))
});

//dist-html
gulp.task('dest-html',function () {
    gulp.src('src/'+htmlName+'.html')
        .pipe(replace(/imgs\/placehold\/(.*)\.png/g,'http://via.placeholder.com/$1/ffddff'))
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
    return gulp.src('dist/css/'+ htmlName +'/*.css')
             .pipe(replace(/\.\.\/\.\.\/imgs\//g,img))
             .pipe(gulp.dest('dist/css/'+ htmlName));
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
    return gulp.src('dist/'+htmlName+'.html').on('data',function (file) {
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
                    res[1].match(regexpMin)?obj.css.push(res[1].match(regexpMin)[1]):obj.css.push(res[1].match(regexpIndex)[1]);
                }else if(line[0].match('js')){
                    let res = line[j].match(regexpSrc);
                    res[1].match(regexpMin)?obj.js.push(res[1].match(regexpMin)[1]):obj.js.push(res[1].match(regexpIndex)[1]);
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
            'css':'<link rel="stylesheet" href="'+ obj.protocol +obj.domains[Math.floor(Math.random()*obj.domains.length)] + '/min/index.php?f=' + obj.css.join(',') +'">',
            'js':'<script src="'+ obj.protocol +obj.domains[Math.floor(Math.random()*obj.domains.length)] + '/min/index.php?f=' + obj.js.join(',') +'"></script>'
        }))
        .pipe(gulp.dest('dist'))
});

//svn
gulp.task('dest-svn',['urlConcat','cssReplace'],function () {
    gulp.src('dist/js/*.js')
        .pipe(gulp.dest(jsSvn));
    gulp.src('dist/css/'+ htmlName +'/*.css')
        .pipe(gulp.dest(cssSvn));
    gulp.src('dist/imgs/'+htmlName+'/*')
        .pipe(gulp.dest(imgsSvn));
    gulp.src('dist/'+htmlName+'.html')
        .pipe(gulp.dest(htmlSvn));
});
