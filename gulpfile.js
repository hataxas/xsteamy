// cоздаем переменную с папкой в которую будет выводиться результат работы gulp (название папки будет соответствовать названию проэкта)
let project_folder = 'dest'

// cоздаем переменную с папкой в которую будет выводиться результат работы gulp (если захотим изменить название папки нужно поменять только здесь а не по всему файлу)
//let project_folder = "dist";
// создаем переменную в которой будет храниться папка с исходниками
let source_folder = "src";
// создаем переменную для подключения шрифтов к scss файлу
let fs = require('fs');
// создаем объект, который содержит пути к различным файлам и папкам
let path = {
  build: {  // папки в которые gulp будет выгружать информацию
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {      // наши рабочие папки которые gulp будет слушать
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // мы слушаем все html файлы кроме тех которые начинаются с подчеркивания
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", //! мы будем слушать все подпапки которые находятся в папке img и выбирать файлы с заданными расширениями
    fonts: source_folder + "/fonts/*.ttf"
  },
  watch: {    // содержит пути к файлам которые нам нужно слушать постоянно
    html: source_folder + "/**/*.html", //! слушаем все что html
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
  },
  // объект отвечающий за удаление папки проэкта каждый раз когда мы запускаем gulp
  clean: "./" + project_folder + "/"
}

// Создаем ряд переменных которые помогут в написании сценария
let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(), // включаем плагин для обновления страницы
  fileinclude = require('gulp-file-include'),  // подключаем плагин для подключению файлов (сборки файлов)(таких как header footer и др.)
  del = require('del'),  // подключаем плагин для удаления папки dist (чтобы не удалять ее каждый раз вручную)
  scss = require('gulp-sass'), // подключаем плагин для обработки scss файлов
  autoprefixer = require('gulp-autoprefixer'), // подключаем плагин для добавления вендерных префиксов к нашим css свойствам
  group_media = require('gulp-group-css-media-queries'), // подключаем плагин для сбора разбросанных по файлу медиа запросов
  clean_css = require('gulp-clean-css'), // подключаем плагин для чистки и сжатия css файла на выходе
  rename = require('gulp-rename'),// переименовываем сжатый файл в min.css
  uglify = require('gulp-uglify-es').default, // подключаем плагин для чистки и сжатия js файла на выходе
  imagemin = require('gulp-imagemin'), // подключаем плагин для сжатия картинок на выходе
  svgSprite = require('gulp-svg-sprite'), // подключаем плагин для объединения иконок в один спрайт (все иконки храняться в одном файле)
  ttf2woff = require('gulp-ttf2woff'), // плагин для обработки шрифтов .ttf
  ttf2woff2 = require('gulp-ttf2woff2'), // плагин для обработки шрифтов .ttf
  fonter = require('gulp-fonter'); // плагин для обработки шрифтов .otf

//! создаем функцию для обновления страницы
function browserSync() {
  browsersync.init({
    server: {  // задаем настройки сервера в которых указываем основную папку
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false  // для того чтобы не появлялась табличка каждый раз при обновлении сервера
  })
}

//! создаем функцию для работы с html файлами
function html() {
  return src(path.src.html) // будет возвращать файлы html которые мы указали в массиве path
    .pipe(fileinclude()) // говорим gulp собирать файлы
    // переносим файлы html из рабочей папки в папку для gulp (используем команду .pipe() это специальная команда для gulp)
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream()) // говорим gulp обновить страницу
}

//! создаем функцию для работы с css файлами
function css() {
  return src(path.src.css) // будет возвращать файлы css которые мы указали в массиве path
    //.pipe(fileinclude()) // говорим gulp собирать файлы (наш препроцессор умеет)
    .pipe(
      scss({
        outputStyle: "expanded" // чтобы scss файлы отображались не сжатыми
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ["last 5 versions"], // автопрефиксер поддерживает 5 последних версий браузеров
        cascade: true // стиль написания каскад
      })
    )
    .pipe(dest(path.build.css)) // выгружаем (переносим файл сss из рабочей папки в папку для gulp) полный файл, который удобно читать
    .pipe(clean_css()) // сжимает файл и чистит его
    .pipe(
      rename({  // после сжатия файла мы его переименуем
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))// переносим сжатый файл .min.сss из рабочей папки в папку dist для gulp
    .pipe(browsersync.stream()) // говорим gulp обновить страницу
}

//! создаем функцию для работы с js файлами
function js() {
  return src(path.src.js) // будет возвращать файлы js которые мы указали в массиве path
    .pipe(fileinclude()) // говорим gulp собирать файлы по частям если нужно
    .pipe(dest(path.build.js)) // переносим файлы js из рабочей папки в папку для gulp
    .pipe(uglify()) // сжимаем js файл
    .pipe(
      rename({  // после сжатия файла мы его переименуем
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js)) // переносим сжатый файл js из рабочей папки в папку для gulp
    .pipe(browsersync.stream()) // говорим gulp обновить страницу
}
//! создаем функцию для работы с картинками
function images() {
  return src(path.src.img) // будет возвращать файлы img которые мы указали в массиве path
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3 //можно задавать значение оптимизации от 0 до 7
      })
    )
    .pipe(dest(path.build.img)) // переносим файлы img из рабочей папки в папку для gulp
    .pipe(browsersync.stream()) // говорим gulp обновить страницу
}
//! создаем функцию для работы со шрифтами
function fonts() {
  src(path.src.fonts) // находит файлы шрифтов которые мы указали в массиве path  с расширением .ttf
    .pipe(ttf2woff()) // обрабатывает шрифты
    .pipe(dest(path.build.fonts)) // переносит шрифты из рабочей папки в папку для gulp
  return src(path.src.fonts)
    .pipe(ttf2woff2()) // обрабатывает шрифты
    .pipe(dest(path.build.fonts)) // переносит шрифты из рабочей папки в папку для gulp
}
//! создаем функционал который будет преобразовывать шрифты .otf в .ttf (этот фунуционал нужно запускать вручную: в другом окне терминала пишем gulp otf2ttf и запускаем)
gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(path.src.fonts));
})

//! создаем фунуционал который будет объединять иконки в один спрайт (этот фунуционал нужно запускать вручную: в другом окне терминала пишем gulp svgSprite и запускаем)
gulp.task('svgSprite', function (params) {
  return gulp.src([source_folder + '/iconsprite/*.svg']) // возвращает найденые svg файлы
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg", // собирает все иконки в один файл
          example: true // создает html файл с примерами иконок
        }
      }
    })
    )
    .pipe(dest(path.build.img)) //выгружаем полученный файл в папку img
})

//! создаем функцию которая будет отслеживать изменения в наших html файлах
function watchFiles() {
  gulp.watch([path.watch.html], html); // указываем следить за файлами html в папке watch и обрабатывать их при помощи функции html
  gulp.watch([path.watch.css], css); // указываем следить за файлами css в папке watch и обрабатывать их при помощи функции css
  gulp.watch([path.watch.js], js); // указываем следить за файлами js в папке watch и обрабатывать их при помощи функции js
  gulp.watch([path.watch.img], images); // указываем следить за img в папке watch и обрабатывать их при помощи функции images
}

//! создаем функцию которая будет удалять cтарую папку dist при запуске gulp
function clean() {
  return del(path.clean); // указываем путь к папке dist
}

//! создаем функции для подключения шрифтов к файлу стилей (шрифты готовые к подключению собираются в папку fonts.scss и подключаются к style.css в папке dist)
function fontsStyle(params) {

  let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb() { }
function cb() {

}

// Нужно подружить функции с gulp
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync); // parallel для того чтобы функции выполнялись параллельно

// нужно подружить gulp с новыми переменными (чтобы он их понимал)
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // по умолчанию при запуске gulp запускается browserSync
