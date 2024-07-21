import { IToken, LiteralVal, TokenType } from '@/types/token';

export class Token implements IToken {
  readonly tokenType: TokenType;
  readonly lexeme: string;
  readonly literal: LiteralVal;
  readonly line: number;

  constructor(token: Omit<IToken, 'toString'>) {
    this.tokenType = token.tokenType;
    this.lexeme = token.lexeme;
    this.literal = token.literal;
    this.line = token.line;
  }

  public toString() {
    return `${this.tokenType} ${this.lexeme} ${this.literal}`;
  }
}
