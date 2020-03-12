#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const watch = require('./lib/src/watch')
const build = require('./lib/src/build')
const scripts = require('./lib/cli/scripts')
const configure = require('./lib/cli/configure')
const purge = require('./lib/src/purge')
const updateNotifier = require('update-notifier')
const pkg = require('./package.json')

program
  .command('build')
  .alias('b')
  .description('Builds Tailwind')
  .option('-p, --purge', 'run PurgeCSS with this build')
  .option(
    '-c, --config <config>',
    'relative path to alternate ng-tailwind.js file'
  )
  .action(args => {
    build({ purgeFlag: args.purge, configPath: args.config })
  })

program
  .command('watch')
  .alias('w')
  .description('Watches Tailwind files and rebuilds on changes')
  .option(
    '-c, --config <config>',
    'relative path to alternate ng-tailwind.js file'
  )
  .action(args => {
    watch({ configPath: args.config })
  })

program
  .command('configure')
  .alias('c')
  .description(
    'Configure your tailwind setup using custom arguments or the default setup;\n\tRestart of development server required for changes to take effect'
  )
  .option('-c, --config <config>', 'relative path to tailwind.config.js file')
  .option('-s, --source <source>', 'relative path to css source file')
  .option(
    '-o, --output <output>',
    'relative path to css output file (referenced in angular.json output array)'
  )
  .option(
    '-d, --default',
    'overwrites ng-tailwind.js file to default paths except any concurrent arguments'
  )
  .option(
    '-p, --purge',
    'Sets `purge: true` in ng-tailwind.js, causing every build to run PurgeCSS, even during development'
  )
  .option(
    '--unset-purge',
    'Sets `purge: false` in ng-tailwind.js, which is the default configuration'
  )
  .option('--sass', 'Sets `sass: true` in ng-tailwind.js. Default is `false`.')
  .action(args => {
    if (args.purge && args.unsetPurge) {
      return console.error('To purge or not to purge...make up your mind.')
    }

    const ngTwConfig = {}

    if (args.config) {
      ngTwConfig.configJS = path.normalize(path.resolve(args.config))
    }

    if (args.source) {
      ngTwConfig.sourceCSS = path.normalize(path.resolve(args.source))
    }

    if (args.output) {
      ngTwConfig.outputCSS = path.normalize(path.resolve(args.output))
    }

    if ({}.hasOwnProperty.call(args, 'purge') || args.unsetPurge) {
      ngTwConfig.purge = args.purge || false
    }

    if (args.sass) {
      ngTwConfig.sass = args.sass || false
    }

    configure(ngTwConfig, args.default)
  })

program
  .command('scripts')
  .alias('s')
  .description(
    'Automatically inserts the default build/serve/watch scripts into your package.json'
  )
  .action(cmd => {
    scripts()
  })

program
  .command('purge')
  .alias('p')
  .description(
    'Run PurgeCSS on your output file to eliminate unused CSS selectors'
  )
  .option(
    '-c, --config <config>',
    'relative path to alternate ng-tailwind.js file'
  )
  .option('-k, --keyframes', 'PurgeCSS will remove unused keyframes')
  .option('-f, --fontface', 'PurgeCSS will remove unused fontfaces')
  .option(
    '-r, --rejected',
    'Print the list of rejected selectors to the console'
  )
  .action(args => {
    purge({
      keyframes: args.keyframes,
      fontFace: args.fontFace,
      rejected: args.rejected,
      configPath: args.config
    })
  })

program.version(require('./package.json').version, '-v, --version')

program.parse(process.argv)

updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 }).notify({
  isGlobal: true
})