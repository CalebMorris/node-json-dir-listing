#!/usr/bin/env node

if (module.parent !== null) {
  throw new Error('Inproper use: for library use, look in src/. This is the bin root.');
}

var program = require('commander');

var packageInfo = require('../package.json');
var command = require('../src/listing-runner');

var usageString = '[options] <dir>';

program
  .version(packageInfo.version)
  .usage(usageString)
  .option('-d, --dryrun', 'Run through the process without actually creating any new files')
  // TODO: [Start]
  .option('-R, --recursive', 'Recursively create listings for all subfolders')
  .option('-s, --sparse [depth]', 'Create listings that only contains n [depth] of children', 1)
  .option('-v, --verbose', 'Display more information as we walk the directory')
  .option('-o, --output [name]', 'Specify the name to use for the file output', '.files.json')
  .option('--override', 'Override any current files')
  .option('-p, --patch', 'Update current listings')
  // TODO: [End]
  .parse(process.argv);

var options = {};

options.verbose = program.verbose;
options.dryrun = program.dryrun;
options.recursive = program.recursive;
options.override = program.override;
options.patch = program.patch;
options.output = program.output;

if (!program.args || program.args.length === 0) {
  console.log('Usage: ' + usageString);
  process.exit(-1);
}

return command(program.args[0], options)
  .then(function(info) {
    if (info) {
      console.log(info);
    }
  })
  .catch(function(err) {
    console.error('err', err.stack);
  });
