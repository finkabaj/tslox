#!/usr/bin/env node

import { argv, exit, stdout, stderr } from 'node:process';
import { writeFileSync } from 'node:fs';

if (argv.length !== 3) {
  stdout.write('Usage: gen-ast <output directory>\n');
  exit(64);
}

const outDir = argv[2];
const name = 'Expr';
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
  writeFileSync(
    `${outDir}/${name[0].toLowerCase() + name.slice(1)}.ts`,
    content
  );
} catch (err) {
  stderr.write(`Error: ${err.message}\n`);
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
