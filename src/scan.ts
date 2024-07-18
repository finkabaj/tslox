import { IToken, Literal, TokenType } from '@/types/token';
import { Token } from '@/token';
import { Logger } from './error';

export class Scanner {
  private readonly source: string;
  private readonly tokens: IToken[] = [];
  private readonly logger: Logger;
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(logger: Logger, source: string) {
    this.source = source;
    this.logger = logger;
  }

  public scanTokens(): IToken[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      new Token({
        tokenType: TokenType.EOF,
        lexeme: '',
        literal: {},
        line: this.line,
      })
    );
    return this.tokens;
  }

  private isAtEnd() {
    return this.logger.hadError || this.current >= this.source.length;
  }

  private scanToken() {
    const c = this.advance();

    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      default:
        this.logger.error(this.line, 'Unexpected character.');
        break;
    }
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType): void;
  private addToken(type: TokenType, literal: Literal): void;
  private addToken(type: TokenType, literal?: Literal): void {
    if (literal === null) {
      literal = {};
    }
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token({
        tokenType: type,
        lexeme: text,
        literal: literal!,
        line: this.line,
      })
    );
  }
}
