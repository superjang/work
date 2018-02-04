module.exports = function(grunt){
    var spriteHelper = require('./.grunt-config/sprite-helper.js');
    // var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;
    // var serveStatic = require('serve-static');
    // var serveIndex = require('serve-index');

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        jsdoc: 'grunt-jsdoc',
        sprite: 'grunt-spritesmith',
        includereplace: 'grunt-include-replace',
        sass: 'grunt-contrib-sass',
        htmlhint: 'grunt-htmlhint'
        ,imagemin: 'grunt-contrib-imagemin'
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        path: {
            src: 'src/',
            css: 'css/',
            image: 'image/',
            img_sprite: 'sprite/',
            img_sprite_result: 'im/',
            js: 'js/',
            scss: 'scss/',
            html: 'html/',
            build: 'build/',
            build_html: 'build/html/'
        },
        clean: {
            dist: ['<%= path.build %>']
        },
        htmlhint: {
          options: {
              htmlhintrc: './.grunt-config/.htmlhintrc'
              ,force: true
          },
            dist:[
                '<%= path.build_html %>**/*.html'
            ]
        },
        includereplace: {
            dist: {
                options: {
                    includesDir: 'src/html/include/',
                    globals: {
                        css: '/css',
                        js: '/js',
                        singleImage: '/image/single',
                        spriteImage: '/image/sprite'
                    }
                },
                files: [
                    {
                        cwd: '<%= path.src %><%= path.html %>application/',
                        src: ['**/*.html', '!include/**/*.html', '!index.html'],
                        dest: '<%= path.build_html %>',
                        expand: true
                    }
                ]
            }
        },
        sprite: spriteHelper('src/image/sprite/'),
        imagemin: {
          dist: {
              // options: {
              //     optimizationLevel: 3 // 최적화 레벨 0 to 7
              //     // progressive:true, // 점진적 무손실 변환 jpg
              //     // interlaced: true, // 점진적인 렌더링 맞춤 gif
              //     // svgoPlugins: [{removeViewBox: false}],
              //     // use: [mozjpeg()] // Example plugin usage
              // },
              files: [
                  {
                      expand: true,
                      cwd: 'build/image/single/',
                      src: '**/*.{png,jpg,jpeg,gif}',
                      dest: '<%= path.build %>image/ost_single'
                  }
              ]
          }
        },
        sass: {
            build: {
                options: {
                    style: 'compact', // compressed, expanded, nested, compact
                    require: ['./.grunt-config/functions.rb'],
                    sourcemap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= path.src %><%= path.scss %>application/',
                    src: ['**/*.scss', '!include/**/*.scss', '!**/_*.scss', '!_*.scss'],
                    dest: '<%= path.build %><%= path.css %>',
                    ext: '.css'
                }]
            }
        },
        // browserSync: {
        //     options: {
        //         // proxy:'',
        //         server: {
        //             baseDir: '<%= path.build %>',
        //             directory: true
        //         }
        //         ,watchTask: true
        //     },
        //     bsFiles: {
        //         src : [
        //             '<%= path.src %><%= path.html %>**/*.html',
        //             '<%= path.src %><%= path.scss %>**/*.scss',
        //             '<%= path.src %><%= path.js %>**/*.js'
        //         ]
        //     }
        // },
        uglify: {
            merge: {
                options: {
                    report: 'min',
                    compress: true,
                    mangle: true
                },
                files: '<%= merge_config %>'
            }
        },
        jsdoc : {
            dist : {
                src: ['src/js/naturalcore/**/*.js'],
                options: {
                    destination: 'doc',
                    template : "node_modules/ink-docstrap/template",
                    configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },
        jshint: {
          options: {
              jshintrc: './.grunt-config/.jshintrc',
              force:false,
              reporter: require('jshint-stylish')
          },
            dist: {
              src: ['src/js/**/*.js', '!src/js/common/lib/**/*.js']
            }
        },
        copy: {
            singleImage: {
                expand: true,
                cwd: 'src/image/single/',
                src: '**/*',
                dest: 'build/image/single/'
            },
            media: {
                expand: true,
                cwd: 'src/media/',
                src: '**/*',
                dest: 'build/media/'
            }
        },
        // 병렬수행
        // concurrent:{
        //   target:{
        //       tasks: ['image'], //[['a'],'b']
        //       options:{
        //           logConcurrentOutput: true
        //       }
        //   }
        // },
        watch: {
            includes: {
                files: ['<%= path.src %><%= path.html %>**/*.html'],
                tasks: ['includereplace:dist']
            },
            copy:{
                files: ['src/image/single/**/*.*', 'src/media/**/*.*'],
                tasks: ['copy:singleImage', 'copy:media']
            },
            sprite: {
                files: ['<%= path.src %><%= path.img_sprite %>**/*.png'],
                tasks: ['sprite']
            },
            scss: {
                files: ['<%= path.src %><%= path.scss %>*.scss', '<%= path.src %><%= path.scss %>**/*.scss'],
                tasks: ['sass:build']
            },
            jsmerge: {
                files: [
                    '<%= path.src %><%= path.js %>**/*.js',
                    '!<%= path.src %><%= path.js %>merged/*.js',
                    '!<%= path.src %><%= path.js %>concat/*.js'
                ],
                tasks: ['jsmerge']
            }
        },
        connect: {
            // https://github.com/gruntjs/grunt-contrib-connect
            server:{
                options: {
                    port: 8899,
                    hostname: 'localhost',
                    base: '<%= path.build %>',
                    open: true
                }
            }
            // options: {
            //     port: 8899,
            //     hostname: 'localhost',
            //     base: '<%= path.build %>',
            //     open: true
            // }
            // rules: [
            //     {
            //         from: '/mobile/single/(.*)',
            //         to: '/image/single/$1'
            //     },
            //     {
            //         from: '/mobile/sprite/(.*)',
            //         to: '/image/sprite/$1'
            //     },
            //     {
            //         from: '/mobile/css/(.*)',
            //         to: '/css/$1'
            //     },
            //     {
            //         from: '/mobile/js/(.*)',
            //         to: '/js/$1'
            //     },
            //     {
            //         from: '/mobile/media/(.*)',
            //         to: '/media/$1'
            //     }
            //     // ,{
            //     //     from: '(http:|https:)?(\\/){2}[^:\\/\\s]+\\w+(:\\d+)?\\/mobile\\/(.*)$',
            //     //     to:'//localhost/image/$1',
            //     //     redirect: 'temporary' // 301 permanent / 302 temporary
            //     // }
            // ],
            // ,development: {
            //     options: {
            //         middleware: function (connect, options) {
            //             var middlewares = [];
            //
            //             // RewriteRules support
            //             middlewares.push(rewriteRulesSnippet);
            //
            //             if (!Array.isArray(options.base)) {
            //                 options.base = [options.base];
            //             }
            //
            //             var directory = options.directory || options.base[options.base.length - 1];
            //             options.base.forEach(function (base) {
            //                 // Serve static files.
            //                 middlewares.push(serveStatic(base));
            //             });
            //
            //             // Make directory browse-able.
            //             middlewares.push(serveIndex(directory));
            //
            //             return middlewares;
            //         }
            //     }
            // }
        }
    });

    /**
     * jsmerge task
     */
    grunt.task.registerTask('jsmerge', 'merge and minify js files', function(){
        var jsmergerc = grunt.file.readJSON('./.grunt-config/.jsmergerc');
        var merge_config = {};
        var arr = Object.keys(jsmergerc);
        var appName = '';
        var jsType = '';

        arr.forEach(function(path){
            var key = path.replace('src/js/', 'build/js/');
            var files = [];

            jsType = jsmergerc[path].type;
            appName = jsmergerc[path].name;
            jsmergerc[path].items.forEach(function(file){
                if( jsType === 'common' ){
                    files.push('src/js/' + jsType + '/' + file);
                } else {
                    files.push('src/js/' + jsType + '/' + appName + '/' + file);
                }
            });

            merge_config[key] = files;
        });

        grunt.option('verbose', true);
        grunt.config.set('merge_config', merge_config);
        grunt.task.run('uglify:merge');
    });


    // HTML Index tasks
    grunt.task.registerTask('htmlindex', 'Generates HTML index data', function(){
        require('./.grunt-config/html-index-helper.js')(grunt);
    });

    // grunt.loadNpmTasks('grunt-connect-rewrite');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // grunt.registerTask('server', function (target) {
    //     grunt.task.run([
    //         // 'configureRewriteRules',
    //         'connect:development'
    //         // 'connect'
    //     ]);
    // });

    grunt.registerTask('default', ['clean'], function(){
        grunt.task.run(['includereplace:dist', 'htmlhint:dist', 'sprite', 'copy:singleImage', 'copy:media', 'sass:build', 'jsmerge', 'jshint', 'connect', 'watch']);
    });

    // grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-newer');
    // grunt.registerTask('browserSync', ['browserSync']);

    // grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.registerTask('imageminify', ['imagemin']);
};

/**
 * todo
 * url rewrite,
 * proxy url check mockup for mobile or the others device
 */