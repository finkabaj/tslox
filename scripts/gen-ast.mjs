#!/usr/bin/env node

import { argv, exit, stdout, stderr, stdin } from 'node:process';
import { writeFileSync, existsSync } from 'node:fs';

if (argv.length !== 3) {
  stderr.write('Usage: gen-ast <output directory>\n');
  exit(64);
}

const outDir = argv[2];
const name = 'Expr';
const path = `${outDir}/${name[0].toLowerCase() + name.slice(1)}.ts`;

if (existsSync(path)) {
  const ans = await question(
    'This will overwrite original file. Are you sure? y(es) '
  );
  if (!ans.match(/^y(es)?$/i)) {
    exit(0);
  }
}

const token = 'IToken';
const literal = 'Literal';

let content = '';

const asArray = [
  `Binary : ${name} left,${token} op,${name} right`,
  `Grouping : ${name} expr`,
  `Literal : ${literal} val`,
  `Unary : ${token} op,${name} right`,
];

content += `import { ${token}, ${literal} } from '@/types/token';\n\n`;

content += `export abstract class ${name} {\n`;
for (const as of asArray) {
  const className = as.split(':')[0].trim();
  const fields = as.split(':')[1].trim();
  content += `\tstatic ${className} = class {\n`;
  content += `${writeFields(fields.split(','))}\n`;
  content += `${writeConstructor(fields.split(','))}`;
  content += '\t};\n\n';
}

content += '}\n';

try {
  writeFileSync(path, content);
  stdout.write(`succesfully created at path: ${path}\n`);
  exit(0);
} catch (err) {
  stderr.write(`${err.message}\n`);
  exit(66);
}

function writeFields(fields) {
  let str = '';
  for (const field of fields) {
    const type = field.split(' ')[0];
    const name = field.split(' ')[1];
    str += `\t\treadonly ${name}: ${type};\n`;
  }

  return str;
}

function writeConstructor(fields) {
  let str = '\t\tconstructor(';
  let i = 0;
  for (const field of fields) {
    const type = field.split(' ')[0];
    const name = field.split(' ')[1];
    str += ++i !== fields.length ? `${name}: ${type}, ` : `${name}: ${type}`;
  }

  str += ') {\n';

  for (const field of fields) {
    const name = field.split(' ')[1];
    str += `\t\t\tthis.${name} = ${name};\n`;
  }

  str += '\t\t}\n';

  return str;
}

function question(query) {
  stdout.write(query);
  return new Promise((resolve) => {
    stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}
