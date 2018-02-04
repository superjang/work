/**
 * sprite-helper
 * 디렉토리 기준 실행
 */
module.exports = function(spritePath){
    var fs = require("fs");
    var extend = require('util')._extend;
    var Mustache = require('mustache');
    var spritePath = spritePath;
    var helperUtil = {
        getDirectories: function(src){
            var directories = [];

            fs.readdirSync(src).map(function(subdir){
                var isDirectory = fs.statSync(spritePath + subdir).isDirectory();

                if(isDirectory){
                    directories.push(subdir);
                }
            });

            return directories;
        },
        createOptions: function(name, isVertical, options){
            var mustacheTpl = isVertical ? '.grunt-config/sp-template/sp-vertical.mustache' : '.grunt-config/sp-template/sp-mosaic.mustache';

            // var src = 'src/image/' + name + '/sprite/*.png';
            // var dest = 'build/image/' + name + '/sprite/sp-' + name + '.png';
            // var destCss = 'src/scss/sprite/' + name + '.scss';
            // var imgPath = '/image/' + name + '/sprite/sp-' + name + '.png';

            var src = 'src/image/sprite/' + name + '/*.png';
            var dest = 'build/image/sprite/' + name + '/sp-' + name + '.png';
            var destCss = 'src/scss/sprite/' + name + '.scss';
            var imgPath = '/image/sprite/' + name + '/sp-' + name + '.png';
            var cssSpritesheetName = 'sp-' + name;
            var cssTemplate = function(params){
                var tpl = fs.readFileSync(mustacheTpl, 'utf-8');
                return Mustache.render(tpl, params);
            };
            var defaults = {
                padding: 4,
                algorithm: 'binary-tree',
                cssOpts: {
                    zerounit: function(){
                        return function(text, render){
                            var value = render(text);
                            return '0px' === value ? '0' : value;
                        };
                    }
                }
            };
            var spriteOptions = extend(defaults, {
                src: src,
                dest: dest,
                destCss: destCss,
                imgPath: imgPath,
                cssSpritesheetName: cssSpritesheetName,
                cssTemplate: cssTemplate
            });

            return spriteOptions;
        }
    };
    var verticalOptions = {
        padding: 50,
        algorithm: 'top-down'
    };
    var spriteDirectories = helperUtil.getDirectories(spritePath);
    var spriteOptions = {};

    spriteDirectories.map(function(dir){
        if(dir !== 'vertical'){
            spriteOptions[dir] = helperUtil.createOptions(dir);
        }else{
            spriteOptions[dir] = helperUtil.createOptions(dir, true, verticalOptions);
        }
    });

    return spriteOptions;
};
