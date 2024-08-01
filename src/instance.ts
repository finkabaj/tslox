import { LoxClass } from './class';
import { RuntimeError } from './logger';
import { IToken, LiteralVal } from './types/token';

export class LoxInstance {
  private klass: LoxClass;
  private readonly fields: Map<string, LiteralVal> = new Map();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  public get(name: IToken): LiteralVal {
    const field = this.fields.get(name.lexeme);
    if (field !== undefined) return field;

    const method = this.klass.findMethod(name.lexeme);
    if (method !== undefined) return method.bind(this);

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  public set(name: IToken, value: LiteralVal): void {
    this.fields.set(name.lexeme, value);
  }

  public toString() {
    return `${this.klass.name} instance`;
  }
}
