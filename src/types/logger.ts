import { RuntimeError } from '@/logger';
import { IToken } from './token';

interface ErrorOveload {
  (line: number, message: string): void;
  (token: IToken, message: string): void;
}

export interface ILogger {
  hadError: boolean;
  error: ErrorOveload;
  runtimeError: (err: RuntimeError) => void;
}
