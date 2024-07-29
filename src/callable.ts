import { Interpreter } from '@/interpreter';
import { LiteralVal } from '@/types/token';

export interface LoxCallable {
  call: (interpreter: Interpreter, args: LiteralVal[]) => LiteralVal;
  arity: () => number;
  toString: () => string;
}

export function isLoxCallable(val: LiteralVal): val is LoxCallable {
  return (
    val != null &&
    typeof val === 'object' &&
    'call' in val &&
    'arity' in val &&
    'toString' in val
  );
}
