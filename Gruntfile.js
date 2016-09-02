module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'css/main.min.css': 'css/main.scss'
                }
            }
        },
        watch: {
            options: {
                spawn: false,
                interrupt: true,
                livereload: true
            },
            scripts: {
                files: ['css/**/*.scss'],
                tasks: ['css']
            },
            scripts: {
                files: ['js/**/*.js'],
                tasks: []
            },
            html: {
                files: ['index.html'],
                tasks: []
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');

    grunt.registerTask('default', ['sass', 'watch']);
    grunt.registerTask('css', ['sass']);

};