#!/usr/bin/env node

import { argv, exit, stdout, stderr, stdin } from 'node:process';
import { writeFileSync, existsSync } from 'node:fs';

if (argv.length !== 3) {
  stderr.write('Usage: gen-ast <output directory>\n');
  exit(64);
}

const outDir = argv[2];

const token = 'IToken';
const literal = 'LiteralVal';
const tokenImport = `import { ${token}, ${literal}} from '@/types/token';`;

const exprName = 'Expr';
const exprs = [
  `Binary: ${exprName} left,${token} op,${exprName} right`,
  `Grouping: ${exprName} expr`,
  `Literal: ${literal} val`,
  `Unary: ${token} op,${exprName} right`,
  `Variable: ${token} name`,
];
const exprImports = `import { ${exprName} } from '@/${exprName[0].toLowerCase() + exprName.slice(1)}';`;

const stmtName = 'Stmt';
const stmts = [
  `Expression: ${exprName} expr`,
  `Print: ${exprName} expr`,
  `Var: ${token} name,${exprName}|null initializer`,
];

await defineAst(outDir, exprName, exprs, [tokenImport]);
await defineAst(outDir, stmtName, stmts, [exprImports, tokenImport]);

exit(0);

async function defineAst(outDir, name, asArray, imports) {
  const path = `${outDir}/${name[0].toLowerCase() + name.slice(1)}.ts`;
  if (existsSync(path)) {
    const ans = await question(
      'This will overwrite original file. Are you sure? y(es) '
    );
    if (!ans.match(/^y(es)?$/i)) {
      return;
    }
  }

  let content = '';
  for (const i of imports) {
    content += `${i}\n`;
  }
  content += '\n';

  content += writeVisitor(name, asArray) + '\n';

  content += `export interface ${name}Visitor<R> {\n`;
  content += `\tvisit: ${name}VisitorMap<R>;\n`;
  content += '}\n\n';

  content += `export abstract class ${name} {\n`;
  content += `\tabstract accept<R>(visitor: ${name}Visitor<R>): R;\n`;
  content += '}\n\n';

  for (const as of asArray) {
    const className = as.split(':')[0].trim();
    const fields = as.split(':')[1].trim();
    content += `export class ${className} extends ${name} {\n`;
    content += writeConstructor(fields.split(',')) + '\n';
    content += writeAccept(name, className);
    content += '}\n\n';
  }

  try {
    writeFileSync(path, content);
    stdout.write(`succesfully created at path: ${path}\n`);
  } catch (err) {
    stderr.write(`${err.message}\n`);
    exit(66);
  }
}

function writeVisitor(name, asArray) {
  let str = `export type ${name}VisitorMap<R> = {\n`;
  for (const as of asArray) {
    const className = as.split(':')[0].trim();
    str += `\tvisit${className}${name}: (expr: ${className}) => R;\n`;
  }

  str += '};\n';

  return str;
}

function writeConstructor(fields) {
  let str = '\tconstructor(\n';
  for (const field of fields) {
    const type = field.split(' ')[0];
    const name = field.split(' ')[1];
    str += `\t\tpublic readonly ${name}: ${type},\n`;
  }

  str += '\t) {\n';
  str += '\t\tsuper();\n';
  str += '\t}\n';

  return str;
}

function writeAccept(name, className) {
  let str = `\taccept<R>(visitor: ${name}Visitor<R>): R {\n`;
  str += `\t\t return visitor.visit.visit${className}${name}(this);\n`;
  str += '\t}\n';

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
