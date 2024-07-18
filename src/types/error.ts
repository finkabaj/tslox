export interface ILogger {
  hadError: boolean;
  error(line: number, message: string): void;
}
