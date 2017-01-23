# Postcss-compass 

[PostCSS] plugin for migration from Compass to Libsass. First of all include compass mixins from [compass-mixins], it will do most work. Plugin tries to convert features tphat sass can't handle. 
For now it cover only `image-url()` , `image-width()`, `image-height()`, `font-files()` and fix some `linear-gradient` bugs of [compass-mixins]

[PostCSS]: https://github.com/postcss/postcss
[compass-mixins]: https://github.com/Igosuki/compass-mixins

```css
.foo {
  background-image: image-url('bar.png');
  background-size: image-width('bar.png') image-height('bar.png');
}
```

```css
.foo {
  background-image: url('../images/bar.png');
  background-size: 64px 64px;
}
```

## Usage

```js
var post_compass = require('postcss-compass');
...
gulp.task('sass', function() {
    var processors = [
        post_compass({
            css: './css',
            font: './fonts',
            image: './images'
        }),
        autoprefixer({ remove: true })
    ];
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(gulp.dest('./css'));
});
```

See [PostCSS] docs for examples for your environment.

## Options

Like Compass has

#### options.css
Type: `String`

Output directory

#### options.font
Type: `String`

Directory with fonts

#### options.image
Type: `String`

Directory with images

