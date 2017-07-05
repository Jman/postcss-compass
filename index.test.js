const postcss = require('postcss'),
      compass = require('./'),
      options = {
          css: './css',
          font: './fonts',
          image: './test/img'
      };

function run(input, output, opts) {
    return postcss([ compass(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

it('image-url', () => {
    run('a{ background:image-url("1.gif"); }',
        'a{ background:url(\'../test/img/1.gif\'); }', options);
});

it('image-width & image-height', () => {
    run('a{ width:image-width("1.gif"); width:image-height("1.gif"); }',
        'a{ width:1px; width:1px; }', options);
});

it('font-file', () => {
    run('@font-face { font-family: "gulp";\n' +
        'src:font-files("1.eot", "1.svg", "1.ttf", "1.woff"); }',
        '@font-face { font-family: "gulp";\n' +
        'src:url(\'../fonts/1.eot\') format(\'embedded-opentype\'),\n' +
        'url(\'../fonts/1.svg\') format(\'svg\'),\n' +
        'url(\'../fonts/1.ttf\') format(\'truetype\'),\n' +
        'url(\'../fonts/1.woff\') format(\'woff\'); }', options);
});