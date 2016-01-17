module.exports = function (angel) {
  angel.on('watchcss', function (angel) {
    var loadDNA = require('organic-dna-loader')
    var runPipeline = require('organic-stem-devtools/lib/gulp-pipeline')
    var less = require('gulp-less')
    var lessWatcher = require('gulp-less-watcher')
    var glob = require('glob-stream')
    var path = require('path')

    var LessPluginAutoPrefix = require('less-plugin-autoprefix')
    var config = {
      verbose: true,
      plugins: [ new LessPluginAutoPrefix() ]
    }

    loadDNA(function (err, dna) {
      if (err) return console.error(err)
      var options = dna.client.build
      glob.create(options.src + (options['watchcss'] ? options['watchcss'].pattern : '/**/*.bundle.css'))
        .on('data', function (file) {
          runPipeline({
            name: 'watchcss',
            src: file.path,
            pipeline: [
              lessWatcher(config),
              less(config)
            ],
            dest: options.dest.watch + path.dirname(file.path.replace(path.join(process.cwd(),options.src), ''))
          }).on('end', function () {
            console.log('css watch successfully')
          })
        })
    })
  })
}
