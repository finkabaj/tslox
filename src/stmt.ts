import { Expr } from '@/expr';

export type StmtVisitorMap<R> = {
  visitExpressionStmt: (expr: Expression) => R;
  visitPrintStmt: (expr: Print) => R;
};

export interface StmtVisitor<R> {
  visit: StmtVisitorMap<R>;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class Expression extends Stmt {
  constructor(public readonly expr: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitExpressionStmt(this);
  }
}

export class Print extends Stmt {
  constructor(public readonly expr: Expr) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitPrintStmt(this);
  }
}
