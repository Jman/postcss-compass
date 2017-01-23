const path  = require('path');
const fs    = require('fs');
const imgSize = require('image-size')
const postcss = require('postcss');
const format = {
    'woff' : "format('woff')",
    'ttf' : "format('truetype')",
    'eot' : "format('embedded-opentype')"
};

var imageUrl = function (decl, options) {
    var value = decl.value;
    if (value.indexOf( 'image-url(' ) !== -1) {
        var img_url = value.match(/image-url\(([^)]+)\)/)[1].replace(/["']/g, "");
        var img_path = options.image + '/' + img_url ;
        var new_value = path.relative(options.css, img_path);
        decl.value = value.replace(/image-url\(.+?\)/, "url('"+  new_value +"')")
    }
}

var imageSize = function (decl, options) {
    var value = decl.value;
    if (value.indexOf( 'image-width(' ) !== -1) {
        var img_url = value.match(/image-width\(([^)]+)\)/)[1].replace(/["']/g, "");
        var img_path = options.image + '/' + img_url ;
        var width = imgSize(img_path).width;
        decl.value = value.replace(/image-width\(.+?\)/, width + 'px')
        value = decl.value
    }
    if (value.indexOf( 'image-height(' ) !== -1) {
        var img_url = value.match(/image-height\(([^)]+)\)/)[1].replace(/["']/g, "");
        var img_path = options.image + '/' + img_url ;
        var height = imgSize(img_path).height;
        decl.value = value.replace(/image-height\(.+?\)/, height + 'px')
    }
}


var linearGradient = function (decl, options) {
    var value = decl.value;
    if (value.indexOf( 'linear-gradient(' ) !== -1) {
        var args = value.match(/linear-gradient\(([^)]+)\)/)[1].split(', ');
        if(args[0].indexOf("top") !== -1) {
            args[0] = 'to bottom';
        }
        decl.value = value.replace(/linear-gradient\(.+?\)/, "linear-gradient(" + args.join(', ') + ")");
    }
    if (value.indexOf( '-owg-linear-gradient(' ) !== -1) {
        decl.remove();
    }

}

var fontFiles = function (decl, options) {
    var value = decl.value;
    if (value.indexOf( 'font-files(' ) !== -1) {
        var font_urls = value.match(/font-files\(([^)]+)\)/)[1].replace(/["' ]/g, "").split(',');
        var new_values = []
        font_urls.forEach(function(font_url){
            var font_path = options.font + '/' + font_url ;
            var new_path = path.relative(options.css, font_path);
            var ext = path.extname(new_path).toLowerCase().substr(1)
            new_values[new_values.length] = "url('"+ new_path +"') " +  format[ext];
        });
        decl.value = value.replace(/font-files\(.+?\)/, new_values.join(',\n'))

    }
}

var cleanImg = function(decl){
    var value = decl.value;
    if(value.indexOf( '-owg-image-url(' ) !== -1 ||
        value.indexOf( '-webkit-image-url(' ) !== -1 ||
        value.indexOf( '-moz-image-url(' ) !== -1 ||
        value.indexOf( '-o-image-url(' ) !== -1){
        decl.remove();
    }
}

module.exports = postcss.plugin('compass', function compass(options) {

    return function (css) {

        options = options || {};
        css.walkRules(function (rule) {
            rule.walkDecls(function (decl, i) {
                cleanImg(decl);
                imageUrl(decl, options);
                imageSize(decl, options);
                linearGradient(decl, options);
            });

        });

        css.walkAtRules(function(rule){
            rule.walkDecls(function (decl, i) {
                fontFiles(decl, options)
            });
        })

    }

});