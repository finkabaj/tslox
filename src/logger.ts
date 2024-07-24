import { stderr } from 'node:process';
import { ILogger } from '@/types/logger';
import { IToken, TokenType } from '@/types/token';

export class RuntimeError extends Error {
  readonly token: IToken;

  constructor(token: IToken, message: string) {
    super(message);
    this.token = token;
  }
}

export class Logger implements ILogger {
  public hadError: boolean = false;
  public hadRuntimeError: boolean = false;

  constructor() {}

  public runtimeError(err: RuntimeError): void {
    stderr.write(`${err.message}\n[line${err.token.line}]\n`);
    this.hadRuntimeError = true;
  }

  public error(line: number, message: string): void;
  public error(token: IToken, message: string): void;
  public error(x: IToken | number, message: string): void {
    if (typeof x === 'number') {
      this.report(x, '', message);
      return;
    }
    if (x.type === TokenType.EOF) {
      this.report(x.line, ' at end', message);
    } else {
      this.report(x.line, `at '${x.lexeme}'`, message);
    }
  }

  private report(line: number, where: string, message: string) {
    stderr.write(`[line ${line}] Error ${where}: ${message}\n`);
    this.hadError = true;
  }
}
