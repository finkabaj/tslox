import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  ExprVisitorMap,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  This,
  Unary,
  Variable,
} from '@/expr';
import {
  Block,
  Class,
  Expression,
  Func,
  If,
  Print,
  Return,
  Stmt,
  StmtVisitor,
  StmtVisitorMap,
  Var,
  While,
} from '@/stmt';
import { Interpreter } from '@/interpreter';
import { IToken } from './types/token';
import { ILogger } from './types/logger';

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly interpreter: Interpreter;
  private readonly scopes: Map<string, boolean>[] = [];
  private readonly logger: ILogger;
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;

  constructor(interpreter: Interpreter, logger: ILogger) {
    this.interpreter = interpreter;
    this.logger = logger;
  }

  visit: ExprVisitorMap<void> & StmtVisitorMap<void> = {
    visitBlockStmt: (stmt: Block) => {
      this.beginScope();
      this._resolve(stmt.statements);
      this.endScope();
    },
    visitClassStmt: (stmt: Class) => {
      const enclosingClass = this.currentClass;
      this.currentClass = ClassType.CLASS;

      this.declare(stmt.name);
      this.define(stmt.name);

      this.beginScope();
      this.scopes[this.scopes.length - 1].set('this', true);

      for (const method of stmt.methods) {
        let declaration = FunctionType.METHOD;
        if (method.name.lexeme === 'init') {
          declaration = FunctionType.INITIALIZER;
        }
        this.resolveFunction(method, declaration);
      }

      this.endScope();

      this.currentClass = enclosingClass;
    },
    visitExpressionStmt: (stmt: Expression) => this._resolve(stmt.expr),
    visitFuncStmt: (stmt: Func) => {
      this.declare(stmt.name);
      this.define(stmt.name);

      this.resolveFunction(stmt, FunctionType.FUNCTION);
    },
    visitIfStmt: (stmt: If) => {
      this._resolve(stmt.condition);
      this._resolve(stmt.thenBranch);
      if (stmt.elseBranch != null) this._resolve(stmt.elseBranch);
    },
    visitPrintStmt: (stmt: Print) => this._resolve(stmt.expr),
    visitReturnStmt: (stmt: Return) => {
      if (this.currentFunction === FunctionType.NONE)
        this.logger.error(stmt.keyword, "Can't return from top-level code.");

      if (stmt.value !== null) {
        if (this.currentFunction === FunctionType.INITIALIZER) {
          this.logger.error(
            stmt.keyword,
            "Can't return a value from and initializer."
          );
        }

        this._resolve(stmt.value);
      }
    },
    visitVarStmt: (stmt: Var) => {
      this.declare(stmt.name);
      if (stmt.initializer !== null) {
        this._resolve(stmt.initializer);
      }
      this.define(stmt.name);
    },
    visitWhileStmt: (stmt: While) => {
      this._resolve(stmt.condition);
      this._resolve(stmt.body);
    },
    visitAssignExpr: (expr: Assign) => {
      this._resolve(expr.value);
      this.resolveLocal(expr, expr.name);
    },
    visitBinaryExpr: (expr: Binary) => {
      this._resolve(expr.right);
      this._resolve(expr.left);
    },
    visitCallExpr: (expr: Call) => {
      this._resolve(expr.callee);
      expr.args.forEach((arg) => this._resolve(arg));
    },
    visitGetExpr: (expr: Get) => this._resolve(expr.object),

    visitGroupingExpr: (expr: Grouping) => this._resolve(expr.expr),
    visitLiteralExpr: (_expr: Literal) => {},
    visitLogicalExpr: (expr: Logical) => {
      this._resolve(expr.left);
      this._resolve(expr.right);
    },
    visitSetExpr: (expr: Set) => {
      this._resolve(expr.value);
      this._resolve(expr.object);
    },
    visitThisExpr: (expr: This) => {
      if (this.currentClass === ClassType.NONE) {
        this.logger.error(expr.keyword, "Can't use 'this' outside of a class.");
        return;
      }

      this.resolveLocal(expr, expr.keyword);
    },
    visitUnaryExpr: (expr: Unary) => this._resolve(expr.right),
    visitVariableExpr: (expr: Variable) => {
      if (
        this.scopes.length > 0 &&
        !this.scopes[this.scopes.length - 1].get(expr.name.lexeme)
      ) {
        this.logger.error(
          expr.name,
          "Can't read local variable in its own initializer."
        );
      }

      this.resolveLocal(expr, expr.name);
    },
  };

  private _resolve(expr: Expr): void;
  private _resolve(stmt: Stmt): void;
  private _resolve(statements: Stmt[]): void;
  private _resolve(x: Expr | Stmt | Stmt[]): void {
    if (Array.isArray(x)) {
      for (const statement of x) {
        this._resolve(statement);
      }
      return;
    }

    x.accept(this);
  }

  public resolve(statements: Stmt[]): void {
    this._resolve(statements);
  }

  private resolveFunction(func: Func, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this._resolve(func.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declare(name: IToken): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      this.logger.error(
        name,
        'Already a variable with this name in this scope.'
      );
    }
    scope.set(name.lexeme, false);
  }

  private define(name: IToken): void {
    if (this.scopes.length === 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr, name: IToken): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
