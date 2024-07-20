import { IToken, Literal } from '@/types/token';

export abstract class Expr {
  static Binary = class {
    readonly left: Expr;
    readonly op: IToken;
    readonly right: Expr;

    constructor(left: Expr, op: IToken, right: Expr) {
      this.left = left;
      this.op = op;
      this.right = right;
    }
  };

  static Grouping = class {
    readonly expr: Expr;

    constructor(expr: Expr) {
      this.expr = expr;
    }
  };

  static Literal = class {
    readonly val: Literal;

    constructor(val: Literal) {
      this.val = val;
    }
  };

  static Unary = class {
    readonly op: IToken;
    readonly right: Expr;

    constructor(op: IToken, right: Expr) {
      this.op = op;
      this.right = right;
    }
  };
}
