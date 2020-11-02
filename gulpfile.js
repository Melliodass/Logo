
const project_folder = "dist";  //название папки ,куда будем выгружать проект
const source_folder = "app"; // наша папка с исходниками
const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // файл начинающийся на _ исключаем
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.*",
    fonts: source_folder + "/fonts/*.ttf"
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.*",
  },
  clean: "./" + project_folder + "/"
}
//подключение плагинов
const {src, dest} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),// синхронизация браузера
  fileInclude = require('gulp-file-include'), // подключение отдельных файлов в html c помощью @@include
  del = require('del'), // удаляет ненужные файлы 
  scss = require('gulp-sass'),// компилирует в css
  autoprefixer = require('gulp-autoprefixer'), // добавляет префиксы для поддержки свойств в браузерах
  groupMedia = require('gulp-group-css-media-queries'), // группирует все медиа-запросы в одно место
  cleanCss = require('gulp-clean-css'), // сжимает файл css
  rename = require('gulp-rename'), // переименовывает файлы
  uglify = require('gulp-uglify-es').default, //сжимает js
  babel = require('gulp-babel'),// поддержка старых браузеров при написании нового js 
  //tinypng = require('gulp-tinypng-compress'); // если хотим сжимать tinypng ( 500 сжатий)
  imagemin = require('gulp-imagemin'), // сжимает изображения
 // webp = require('gulp-webp'),//создаёт изображения в формате webp
  // webpHtml = require('gulp-webp-html'), // подключает формат webp в html
  // webpCss = require('gulp-webp-css'),  // подключает формат webp в css
  svgSprite = require('gulp-svg-sprite'),// создает svg спрайты
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),// создает svg спрайты
  fonter = require('gulp-fonter');

  function browserSync(params) {
    browsersync.init({
      server: {
        baseDir: "./" + project_folder + "/"
      },
      port: 3000,
      notify: false
    })
  }

  // функции
  function html() {
    return src(path.src.html)
      .pipe(fileInclude())
      // .pipe(webpHtml())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
  }
  function js() {
    return src(path.src.js)
      .pipe(fileInclude())
      .pipe(dest(path.build.js))
      .pipe(babel({
        presets: ['@babel/env']
    }))
      .pipe(uglify())
      .pipe(
        rename( {
        extname: ".min.js"
      }))
      .pipe(dest(path.build.js))
      .pipe(browsersync.stream())
  }
  function css() {
    return src(path.src.css)
      .pipe(
        scss({
          outputStyle: "expanded"
        })
      )
      .pipe (
        groupMedia()
      ) 
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 10 version"], 
          grid: true,
          cascade: true
        })
      )
      // .pipe(webpCss())
      .pipe(dest(path.build.css))
      .pipe(cleanCss(
        /* {format: 'beautify'} */)) // для вывода красивого кода 
      .pipe(
        rename( {
        extname: ".min.css"
      }))
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  }

  function images() {
    return src(path.src.img)
   /*  .pipe(webp({
         quality: 70
    })
    )  */
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({         //  для imagemin
      interlaced: true,
      progressive: true,
      optimizationLevel: 3,
      svgoPlugins: [ {removeViewBox: true}]
  })
  )
//   .pipe(tinypng({   // для tiny
//     key: 'S0Qnb30rn3T21FnwtW8qVFW7JRllW3gz', // API_KEY на сайте надо получить
//     sigFile: 'images/.tinypng-sigs',
//     log: true
// }))
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
  }
  
  function fontsConvert() {
    src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
  };

// отдельный таск для svg спрайтов
  gulp.task('svgSprite', function(){  
    return gulp.src([source_folder + '/icon-sprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icons/sprite.svg",
          example: true
        }
      }
    }))
    .pipe(dest(path.build.img))
  })

  // таск для конвертации шрифтов otf в ttf для дальнейшей конвертации в woff2
gulp.task('otf2ttf', function(){
  return gulp.src([source_folder + "/fonts/*.otf"])
  .pipe(fonter({
    formats:['ttf']
  }))
  .pipe(dest(source_folder + "/fonts/" ))
})

  function watchFiles(params) {
    gulp.watch([path.watch.html], html);//слежка за изменениями в html 
    gulp.watch([path.watch.css], css); //слежка за изменениями в css 
    gulp.watch([path.watch.js], js); //слежка за изменениями в js 
    gulp.watch([path.watch.img], images); //слежка за изменениями в папке  с картинками
  } 
  function clean(params) {
    return del(path.clean)
  }

let build = gulp.series(clean, gulp.parallel(css, js, html, images, fontsConvert));  
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.fontsConvert = fontsConvert;
exports.images = images;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;

