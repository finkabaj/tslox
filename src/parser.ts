import { IToken, TokenType } from '@/types/token';
import { Binary, Expr, Unary, Literal, Grouping } from '@/expr';
import { ILogger } from '@/types/logger';
import { stderr } from 'node:process';

class ParseError extends Error {}

export class Parser {
  private readonly tokens: IToken[];
  private current: number = 0;
  private readonly logger: ILogger;

  constructor(logger: ILogger, tokens: IToken[]) {
    this.tokens = tokens;
    this.logger = logger;
  }

  public parse(): Expr | null {
    try {
      return this.expression();
    } catch (error) {
      if (error instanceof ParseError) {
        return null;
      }

      stderr.write('Unexpected error during parsing: ' + error);
      return null;
    }
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const op = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, op, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const op = this.previous();
      const right = this.term();
      expr = new Binary(expr, op, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const op = this.previous();
      const right = this.factor();
      expr = new Binary(expr, op, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const op = this.previous();
      const right = this.unary();
      expr = new Binary(expr, op, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const op = this.previous();
      const right = this.unary();
      return new Unary(op, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after expression.');
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expected expression.');
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private consume(type: TokenType, message: string): IToken {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  private error(token: IToken, message: string) {
    this.logger.error(token, message);
    return new ParseError();
  }

  private previous(): IToken {
    return this.tokens[this.current - 1];
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type == type;
  }

  private peek(): IToken {
    return this.tokens[this.current];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): IToken {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }
}