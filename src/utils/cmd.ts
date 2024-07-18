import { Args } from '@/types/cmd';

export const parseArgv = (argv: string[]): Args => {
  const args: Args = {};
  let carg = '';
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const trimedArg = arg.slice(2);
      args[trimedArg] = [];
      carg = trimedArg;
    } else if (carg && arg) {
      args[carg].push(arg);
    }
  }

  return args;
};
