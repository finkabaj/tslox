import { readFileSync } from 'node:fs';
import { stderr, exit } from 'node:process';
import { join } from 'node:path';

export const runFile = (path: string) => {
  try {
    const file = readFileSync(join(__dirname, path), 'utf-8');
    run(file);
  } catch (e) {
    if (e instanceof Error) {
      stderr.write(`Failed to read file: ${e.message}\n`);
    } else {
      stderr.write('An unknown error occured\n');
    }
    exit(72);
  }
};

export const run = (_source: string) => {
  // const scanner
  // const tokens
  // for (const token of tokens) {
  //  print token
  // }
};
