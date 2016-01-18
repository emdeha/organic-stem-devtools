module.exports = function (angel) {
  angel.on('watchjs', function () {
    var loadDNA = require('organic-dna-loader')
    var watchify = require('watchify')
    var browserify = require('browserify')
    var gutil = require('organic-stem-devtools/node_modules/gulp-util')
    var gulp = require('organic-stem-devtools/node_modules/gulp')
    var source = require('vinyl-source-stream')
    var assign = require('lodash').assign
    var globby = require('globby')
    var path = require('path')

    var standardErrorHandler = require('organic-stem-devtools/lib/gulp-error-notifier')({
      name: 'watchjs'
    })

    loadDNA(function (err, dna) {
      if (err) return console.error(err)
      var options = dna.client.build
      globby(options['js'].src)
      .then(function (entries) {
        entries.forEach(function (entry) {
          // add custom browserify options here
          var customOpts = {
            entries: entry,
            debug: true
          }
          var opts = assign({}, watchify.args, customOpts)
          var b = watchify(browserify(opts))
          b.on('update', bundle) // on any dep update, runs the bundler
          b.on('log', gutil.log) // output build logs to terminal

          // apply transformations here
          if (options.js.browserify.transformations) {
            options.js.browserify.transformations.forEach(function (t) {
              b.transform(t)
            })
          }

          function bundle () {
            var bstream = b.bundle().on('error', standardErrorHandler)
            bstream = bstream.pipe(source(entry.replace(options.src + path.sep, '')))
            bstream.pipe(gulp.dest(options.dest.watch))
          }
          bundle()
          console.log('js watch successfully')
        })
      })
      .catch(standardErrorHandler)
    })
  })
}
