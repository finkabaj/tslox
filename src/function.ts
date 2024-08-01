import { LoxCallable } from '@/callable';
import { Func } from '@/stmt';
import { Interpreter } from '@/interpreter';
import { LiteralVal } from '@/types/token';
import { Environment } from '@/environment';
import { Return } from '@/return';
import { LoxInstance } from './instance';

export class LoxFunction implements LoxCallable {
  private readonly declaration: Func;
  private readonly closure: Environment;
  private readonly isInitializer: boolean;

  constructor(declaration: Func, closure: Environment, isInitializer: boolean) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  public call(interpreter: Interpreter, args: LiteralVal[]): LiteralVal {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof Return) {
        if (this.isInitializer) return this.closure.getAt(0, 'this');

        return err.value;
      }
      throw err;
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this');
    return null;
  }

  public bind(instance: LoxInstance): LoxFunction {
    const env = new Environment(this.closure);
    env.define('this', instance);
    return new LoxFunction(this.declaration, env, this.isInitializer);
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
