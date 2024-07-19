#!/usr/bin/env -S ts-node --files

import { exit, stdin, stdout, stderr, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { EX } from '@/types/sysexits';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Scanner } from '@/scan';
import { Logger } from './error';

const logger = new Logger();

const main = () => {
  if (argv.length > 3) {
    stdout.write('Usage: tslass [script]\n');
    exit(EX.USAGE);
  } else if (argv.length == 3) {
    runFile(argv[2]);
  } else {
    repl();
  }
};

const runFile = (path: string) => {
  try {
    const file = readFileSync(join(__dirname, path), 'utf-8');
    run(file);

    if (logger.hadError) {
      exit(EX.DATAERR);
    }
  } catch (e) {
    if (e instanceof Error) {
      stderr.write(`Failed to read file: ${e.message}\n`);
    } else {
      stderr.write('An unknown error occured\n');
    }
    exit(EX.NOINPUT);
  }
};

function repl() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  stdin.write('> ');
  rl.on('line', (ln) => {
    run(ln);
    logger.hadError = false;
    stdout.write('\n> ');
    //stdout.write(`${ln}\n> `);
  });

  rl.on('SIGINT', () => {
    rl.question('Are you sure you want to exit? y(es) ', (ans) => {
      if (ans.match(/^y(es)?$/i)) {
        exit(EX.OK);
      }
      stdout.write('> ');
    });
  });

  rl.on('close', () => {
    stdout.write('\ndone\n');
  });
}

const run = (source: string) => {
  const scanner = new Scanner(logger, source);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    stdout.write(`${token}\n`);
  }
};

main();
