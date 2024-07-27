import { Expr } from '@/expr';
import { IToken, LiteralVal } from '@/types/token';

export type StmtVisitorMap<R> = {
  visitBlockStmt: (expr: Block) => R;
  visitExpressionStmt: (expr: Expression) => R;
  visitPrintStmt: (expr: Print) => R;
  visitVarStmt: (expr: Var) => R;
};

export interface StmtVisitor<R> {
  visit: StmtVisitorMap<R>;
}

export abstract class Stmt {
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class Block extends Stmt {
  constructor(public readonly statements: Stmt[]) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitBlockStmt(this);
  }
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

export class Var extends Stmt {
  constructor(
    public readonly name: IToken,
    public readonly initializer: Expr | null
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitVarStmt(this);
  }
}
