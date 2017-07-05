const path    = require('path'),
      fs      = require('fs'),
      imgSize = require('image-size'),
      postcss = require('postcss');

const format = {
    'woff' : "format('woff')",
    'ttf' : "format('truetype')",
    'svg' : "format('svg')",
    'eot' : "format('embedded-opentype')"
};


const normalize = (url) => {
    url = path.normalize(url);
    return path.sep === '\\' ? url.replace(/\\/g, '\/') : url;
};

const imageUrl = function (decl, options) {
    let value = decl.value;

    if (value.indexOf( 'image-url(' ) !== -1) {

        let img_url = value.match(/image-url\(([^)]+)\)/)[1].replace(/["']/g, ""),
            img_path = options.image + '/' + img_url ,
            new_value = normalize(path.relative(options.css, img_path));

        decl.value = value.replace(/image-url\(.+?\)/, "url('"+  new_value +"')")
    }
};

const imageSize = function (decl, options) {
    let value = decl.value;

    if (value.indexOf( 'image-width(' ) !== -1 || value.indexOf( 'image-height(' ) !== -1) {

        let img_url = value.match(/[image-width|image-height]\(([^)]+)\)/)[1].replace(/["']/g, ""),
            img_path = options.image + '/' + img_url,
            size = imgSize(img_path),
            width = size.width,
            height = size.height;

        decl.value = value.replace(/image-width\(.+?\)/, width + 'px').replace(/image-height\(.+?\)/, height + 'px')
    }
};


const linearGradient = function (decl, options) {
    let value = decl.value;

    if (value.indexOf( 'linear-gradient(' ) !== -1) {

        let args = value.match(/linear-gradient\(([^)]+)\)/)[1].split(', ');
        if(args[0].indexOf("top") !== -1) {
            args[0] = 'to bottom';
        }
        decl.value = value.replace(/linear-gradient\(.+?\)/, "linear-gradient(" + args.join(', ') + ")");
    }

    if (value.indexOf( '-owg-linear-gradient(' ) !== -1) {
        decl.remove();
    }

};

const fontFiles = function (decl, options) {
    let value = decl.value;

    if (value.indexOf( 'font-files(' ) !== -1) {

        let font_urls = value.match(/font-files\(([^)]+)\)/)[1].replace(/["' ]/g, "").split(','),
            new_values = [];

        font_urls.forEach(function(font_url){
            let font_path = options.font + '/' + font_url,
                new_path = path.relative(options.css, font_path),
                ext = path.extname(new_path).toLowerCase().substr(1)
            new_values[new_values.length] = "url('"+ normalize(new_path) +"') " +  format[ext];
        });

        decl.value = value.replace(/font-files\(.+?\)/, new_values.join(',\n'))

    }
};

const cleanImg = function(decl){
    let value = decl.value;

    if(value.indexOf( '-owg-image-url(' ) !== -1 ||
        value.indexOf( '-webkit-image-url(' ) !== -1 ||
        value.indexOf( '-moz-image-url(' ) !== -1 ||
        value.indexOf( '-o-image-url(' ) !== -1){
        decl.remove();
    }
};

module.exports = postcss.plugin('compass', function compass(options) {

    return function (css) {

        options = options || {};

        css.walkRules(function (rule) {
            rule.walkDecls((decl, i) => {
                cleanImg(decl);
                imageUrl(decl, options);
                imageSize(decl, options);
                linearGradient(decl, options);
            });

        });

        css.walkAtRules(function(rule){
            rule.walkDecls((decl, i) => {
                fontFiles(decl, options)
            });
        })

    }

});