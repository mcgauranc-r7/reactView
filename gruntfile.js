// Gruntfile with the configuration of grunt-express and grunt-open. No livereload yet!
module.exports = function(grunt) {
    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    // Configure Grunt 
    grunt.initConfig({
        // Grunt express - our webserver
        // https://www.npmjs.com/package/grunt-express
        express: {
            all: {
                options: {
                    port: 9000,
                    hostname: "localhost",
                    bases: ['./app'], // Replace with the directory you want the files served from
                    // Make sure you don't use `.` or `..` in the path as Express
                    // is likely to return 403 Forbidden responses if you do
                    // http://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
                }
            }
        },
        // grunt-browserify will monitor the projects files, jsx transpile them and concatenate to the one file : app/js/build/app.built.js
        // https://www.npmjs.com/package/grunt-browserify
        browserify: {
            options: {
                transform: [require('grunt-react').browserify],
                browserifyOptions: {
                    debug: true
                }
            },
            client: {
                src: ['app/js/src/*.js'],
                dest: 'app/js/build/app.built.js'
            }
        },
        // grunt-watch will monitor the projects files
        // https://www.npmjs.com/package/grunt-contrib-watch
        watch: {
            all: {                
                files: ['app/js/src/*.js'],
                tasks: ['browserify'],
                options: {
                    livereload: true
                }
            }
        },
        // Grunt Wiredep - dInject dependancies to index.html
        // https://www.npmjs.com/package/grunt-wiredep
        wiredep: {
            task: {
                ignorePath: 'public/',
                cwd: 'public/vendor',
                src: ['views/**/*.handlebars']
            }
        }

    });
    // Creates the `server` task
    grunt.registerTask('server', [
        'express',
        'watch'
    ]);
    //wire in bower dependancies to index.html file
    grunt.registerTask('builddep', ['wiredep']);
};