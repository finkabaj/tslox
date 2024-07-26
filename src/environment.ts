import { IToken, LiteralVal } from '@/types/token';
import { RuntimeError } from '@/logger';

export class Environment {
  private readonly values: Map<string, LiteralVal> = new Map();

  public define(name: string, value: LiteralVal): void {
    this.values.set(name, value);
  }

  public get(name: IToken): LiteralVal {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public assign(name: IToken, value: LiteralVal): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
