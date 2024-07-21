import { IToken, Literal, TokenType } from '@/types/token';
import { Token } from '@/token';
import { Logger } from '@/logger';
import { isCharAlpha, isCharAlphaNumeric, isCharNumber } from '@/utils';

export class Scanner {
  private readonly source: string;
  private readonly tokens: IToken[] = [];
  private readonly logger: Logger;
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  public static readonly keywords: Map<string, TokenType> = new Map()
    .set('and', TokenType.AND)
    .set('class', TokenType.CLASS)
    .set('else', TokenType.ELSE)
    .set('false', TokenType.FALSE)
    .set('for', TokenType.FOR)
    .set('fun', TokenType.FUN)
    .set('if', TokenType.IF)
    .set('nil', TokenType.NIL)
    .set('or', TokenType.OR)
    .set('print', TokenType.PRINT)
    .set('return', TokenType.RETURN)
    .set('super', TokenType.SUPER)
    .set('this', TokenType.THIS)
    .set('true', TokenType.TRUE)
    .set('var', TokenType.VAR)
    .set('while', TokenType.WHILE);

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
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(
          this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(
          this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match('*')) {
          while (
            this.peek() !== '*' &&
            this.peekNext() !== '/' &&
            !this.isAtEnd()
          ) {
            if (this.peek() === '\n') {
              this.line++;
            }
            this.advance();
          }
          this.current += 2;
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (isCharNumber(c)) {
          this.number();
        } else if (isCharAlpha(c)) {
          this.identifier();
        } else {
          this.logger.error(this.line, 'Unexpected character.');
        }
        break;
    }
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private match(expected: string) {
    if (this.isAtEnd()) {
      return false;
    }

    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek() {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source.charAt(this.current);
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }

    return this.source.charAt(this.current + 1);
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

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.logger.error(this.line, 'Unterminated string.');
      return;
    }

    this.advance();

    this.addToken(
      TokenType.STRING,
      this.source.substring(this.start + 1, this.current - 1)
    );
  }

  private number() {
    while (isCharNumber(this.peek())) {
      this.advance();
    }

    if (this.peek() === '.' && isCharNumber(this.peekNext())) {
      this.advance();

      while (isCharNumber(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current - 1))
    );
  }

  private identifier() {
    while (isCharAlphaNumeric(this.peek())) {
      this.advance();
    }

    const str = this.source.substring(this.start, this.current);
    let tt = Scanner.keywords.get(str);

    if (!tt) {
      tt = TokenType.IDENTIFIER;
    }

    this.addToken(tt);
  }
}
