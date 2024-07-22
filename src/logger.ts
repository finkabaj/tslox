import { stderr } from 'node:process';
import { ILogger } from '@/types/logger';
import { IToken, TokenType } from '@/types/token';

export class Logger implements ILogger {
  public hadError: boolean = false;

  constructor() {}

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
