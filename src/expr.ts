import { IToken, LiteralVal } from '@/types/token';

export type ExprVisitorMap<R> = {
  visitAssignExpr: (expr: Assign) => R;
  visitBinaryExpr: (expr: Binary) => R;
  visitCallExpr: (expr: Call) => R;
  visitGetExpr: (expr: Get) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitLogicalExpr: (expr: Logical) => R;
  visitSetExpr: (expr: Set) => R;
  visitSuperExpr: (expr: Super) => R;
  visitThisExpr: (expr: This) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitVariableExpr: (expr: Variable) => R;
};

export interface ExprVisitor<R> {
  visit: ExprVisitorMap<R>;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class Assign extends Expr {
  constructor(
    public readonly name: IToken,
    public readonly value: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitAssignExpr(this);
  }
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

export class Call extends Expr {
  constructor(
    public readonly callee: Expr,
    public readonly paren: IToken,
    public readonly args: Expr[]
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitCallExpr(this);
  }
}

export class Get extends Expr {
  constructor(
    public readonly object: Expr,
    public readonly name: IToken
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitGetExpr(this);
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

export class Logical extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly op: IToken,
    public readonly right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitLogicalExpr(this);
  }
}

export class Set extends Expr {
  constructor(
    public readonly object: Expr,
    public readonly name: IToken,
    public readonly value: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitSetExpr(this);
  }
}

export class Super extends Expr {
  constructor(
    public readonly keyword: IToken,
    public readonly method: IToken
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitSuperExpr(this);
  }
}

export class This extends Expr {
  constructor(public readonly keyword: IToken) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitThisExpr(this);
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

export class Variable extends Expr {
  constructor(public readonly name: IToken) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visit.visitVariableExpr(this);
  }
}
