import { IToken, LiteralVal, TokenType } from '@/types/token';

export class Token implements IToken {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: LiteralVal;
  readonly line: number;

  constructor(token: Omit<IToken, 'toString'>) {
    this.type = token.type;
    this.lexeme = token.lexeme;
    this.literal = token.literal;
    this.line = token.line;
  }

  public toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
