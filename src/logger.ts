import { stderr } from 'node:process';
import { ILogger } from '@/types/error';

export class Logger implements ILogger {
  public hadError: boolean = false;

  constructor() {}

  public error(line: number, message: string) {
    this.report(line, '', message);
  }

  private report(line: number, where: string, message: string) {
    stderr.write(`[line ${line}] Error ${where}: ${message}\n`);
    this.hadError = true;
  }
}
