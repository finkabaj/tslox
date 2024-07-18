import { exit, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { run } from '@/scan';

export const repl = () => {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  stdin.write('> ');
  rl.on('line', (ln) => {
    run(ln);
    stdin.write(`${ln}\n> `);
  });

  rl.on('SIGINT', () => {
    rl.question('Are you sure you want to exit? y(es) ', (ans) => {
      if (ans.match(/^y(es)?$/i)) {
        exit(0);
      }
      stdin.write('> ');
    });
  });

  rl.on('close', () => {
    stdin.write('\ndone\n');
  });
};
