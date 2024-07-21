import { IToken, LiteralVal } from '@/types/token';

export type ExprVisitorMap<R> = {
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitUnaryExpr: (expr: Unary) => R;
};

export interface ExprVisitor<R> {
  visit: ExprVisitorMap<R>;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly op: IToken,
    public readonly right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitBinaryExpr(this);
  }
}

export class Grouping extends Expr {
  constructor(public readonly expr: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  constructor(public readonly val: LiteralVal) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitLiteralExpr(this);
  }
}

export class Unary extends Expr {
  constructor(
    public readonly op: IToken,
    public readonly right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitUnaryExpr(this);
  }
}
