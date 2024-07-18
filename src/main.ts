#!/usr/bin/env -S ts-node --files

import { repl } from '@/repl';

const main = () => {
  const argv = process.argv;
  if (argv.length > 3) {
    process.stdout.write('Usage: tslass [script]\n');
    process.exit(64);
  } else if (argv.length == 3) {
    //run script
  } else {
    repl();
    //run promt
  }
};

main();
