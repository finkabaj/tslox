import { LiteralVal } from '@/types/token';

export class Return extends Error {
  readonly value: LiteralVal;

  constructor(value: LiteralVal) {
    super();
    this.value = value;
  }
}
