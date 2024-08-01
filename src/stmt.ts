import { Expr } from '@/expr';
import { IToken, LiteralVal } from '@/types/token';

export type StmtVisitorMap<R> = {
  visitBlockStmt: (expr: Block) => R;
  visitClassStmt: (expr: Class) => R;
  visitExpressionStmt: (expr: Expression) => R;
  visitFuncStmt: (expr: Func) => R;
  visitIfStmt: (expr: If) => R;
  visitPrintStmt: (expr: Print) => R;
  visitReturnStmt: (expr: Return) => R;
  visitVarStmt: (expr: Var) => R;
  visitWhileStmt: (expr: While) => R;
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

export class Class extends Stmt {
  constructor(
    public readonly name: IToken,
    public readonly methods: Func[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitClassStmt(this);
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

export class Func extends Stmt {
  constructor(
    public readonly name: IToken,
    public readonly params: IToken[],
    public readonly body: Stmt[]
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitFuncStmt(this);
  }
}

export class If extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly thenBranch: Stmt,
    public readonly elseBranch: Stmt | null
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitIfStmt(this);
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

export class Return extends Stmt {
  constructor(
    public readonly keyword: IToken,
    public readonly value: Expr | null
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitReturnStmt(this);
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

export class While extends Stmt {
  constructor(
    public readonly condition: Expr,
    public readonly body: Stmt
  ) {
    super();
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visit.visitWhileStmt(this);
  }
}
