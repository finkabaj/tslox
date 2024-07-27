#!/usr/bin/env -S ts-node --files

import { exit, stdin, stdout, stderr, argv } from 'node:process';
import { createInterface } from 'node:readline';
import { EX } from '@/types/sysexits';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Scanner } from '@/scan';
import { Logger } from '@/logger';
import { Parser } from '@/parser';
import { Interpreter } from './interpreter';

const logger = new Logger();
const interpreter = new Interpreter(logger);

const main = () => {
  if (argv.length > 3) {
    stdout.write('Usage: tslox [script]\n');
    exit(EX.USAGE);
  } else if (argv.length === 3) {
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
    if (logger.hadRuntimeError) {
      exit(EX.SOFTWARE);
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

// TODO: make scopes in REPL

function repl() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  let blocks = 0;
  let block = '';

  const prompt = () => {
    rl.setPrompt(blocks > 0 ? '... ' : '> ');
    rl.prompt();
  };

  prompt();

  rl.on('line', (ln) => {
    if (ln.trim() === '') {
      prompt();
      return;
    }

    blocks += (ln.match(/{/g) || []).length;
    blocks -= (ln.match(/}/g) || []).length;

    if (blocks > 0) {
      block += ln + '\n';
    } else {
      run(block + ln);
      block = '';
      logger.hadError = false;
      logger.hadRuntimeError = false;
    }

    prompt();
  });

  rl.on('SIGINT', () => {
    if (blocks > 0) {
      stdout.write('\n');
      blocks = 0;
      block = '';
      prompt();
    } else {
      rl.question('Are you sure you want to exit? (y/n) ', (ans) => {
        if (ans.toLowerCase() === 'y') {
          rl.close();
        } else {
          prompt();
        }
      });
    }
  });

  rl.on('close', () => {
    stdout.write('\nGoodbye!\n');
    exit(0);
  });
}

const run = (source: string) => {
  const scanner = new Scanner(logger, source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(logger, tokens);
  const statements = parser.parse();

  if (logger.hadError) {
    return;
  }

  interpreter.interpret(statements);
};

main();
