var program = require('commander');

program
  .version('0.0.1')
  .option('-v, --verbose', 'Display more information as we walk the directory')
  .option('-d, --dryrun', 'Run through the process without actually creating any new files')
  .option('-R, --recursive', 'Recursively descend to any subfolders')
  .option('-f, --file [name]', 'Specify the name to use for the file output', '.files.json')
  .option('-o, -override', 'Override any current files.')
  .parse(process.argv);

// console.log('you ordered a pizza with:');
// if (program.peppers) console.log('  - peppers');
// if (program.pineapple) console.log('  - pineapple');
// if (program.bbqSauce) console.log('  - bbq');
// console.log('  - %s cheese', program.cheese);
