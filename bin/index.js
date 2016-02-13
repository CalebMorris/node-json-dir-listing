#!/usr/bin/env node

if (module.parent !== null) {
  throw new Error('Inproper use: for library use, look in src/. This is the bin root.');
}

var program = require('commander');

var packageInfo = require('../package.json');
var command = require('../src/listing-runner');
var defaultListingFile = require('../src/config').defaults.listingFile;

var usageString = '[options] <dir>';

program
  .version(packageInfo.version)
  .usage(usageString)
  .option('-d, --dryrun', 'Run through the process without actually creating any new files')
  .option('-R, --recursive', 'Recursively create listings for all subfolders')
  .option('-o, --output [name]', 'Specify the name to use for the file output', defaultListingFile)
  .option('-s, --sparse [depth]', 'Create listings that only contains n [depth] of children', null)
  // TODO: [Start]
  // .option('-v, --verbose', 'Display more information as we walk the directory')
  // .option('--override', 'Override any current files')
  // .option('-p, --patch', 'Update current listings')
  // TODO: [End]
  .parse(process.argv);

var options = {};

options.verbose = program.verbose;
options.dryrun = program.dryrun;
options.recursive = program.recursive;
options.override = program.override;
options.patch = program.patch;
options.output = program.output;
options.sparse = program.sparse;

if (!program.args || program.args.length === 0) {
  console.log('Usage: ' + usageString);
  process.exit(-1);
}

return command(program.args[0], options)
  .then(function(reports) {
    if (reports) {
      for (var i = 0; i < reports.length; i++) {
        console.log(reports[i]);
      }
    }
  })
  .catch(function(err) {
    console.error('Failed to create listings', err.stack);
    process.exit(-1);
  });
