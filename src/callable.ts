import { Interpreter } from '@/interpreter';
import { LiteralVal } from '@/types/token';

export interface LoxCallable {
  call: (interpreter: Interpreter, args: LiteralVal[]) => LiteralVal;
  arity: () => number;
}

export function isLoxCallable(obj: LiteralVal): obj is LoxCallable {
  const cast = <LoxCallable>obj;
  return cast.call !== undefined && cast.arity !== undefined;
}
