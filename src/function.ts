import { LoxCallable } from '@/callable';
import { Func } from '@/stmt';
import { Interpreter } from '@/interpreter';
import { LiteralVal } from '@/types/token';
import { Environment } from '@/environment';
import { Return } from '@/return';

export class LoxFunction implements LoxCallable {
  private readonly declaration: Func;

  constructor(declaration: Func) {
    this.declaration = declaration;
  }

  public call(interpreter: Interpreter, args: LiteralVal[]): LiteralVal {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof Return) {
        return err.value;
      }
      throw err;
    }
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
