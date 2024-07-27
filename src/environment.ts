import { IToken, LiteralVal } from '@/types/token';
import { RuntimeError } from '@/logger';

export class Environment {
  private readonly values: Map<string, LiteralVal> = new Map();

  constructor(readonly enclosing?: Environment) {}

  public define(name: string, value: LiteralVal): void {
    this.values.set(name, value);
  }

  public get(name: IToken): LiteralVal {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    if (this.enclosing) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public assign(name: IToken, value: LiteralVal): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) return this.enclosing.assign(name, value);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
