import {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  ExprVisitorMap,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from '@/expr';
import { IToken, LiteralVal, TokenType } from '@/types/token';
import { RuntimeError } from '@/logger';
import { stdout } from 'process';
import { ILogger } from '@/types/logger';
import {
  Block,
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
import { Environment } from '@/environment';
import { isLoxCallable } from '@/callable';
import { LoxFunction } from '@/function';
import { Return as ReturnException } from '@/return';

export class Interpreter implements ExprVisitor<LiteralVal>, StmtVisitor<void> {
  readonly globals = new Environment();
  private environment: Environment = this.globals;
  private readonly locals: Map<Expr, number> = new Map();

  constructor(private readonly logger: ILogger) {
    this.globals.define('clock', {
      arity: () => 0,
      call: () => Date.now() / 1000,
      toString: () => '<native fn>',
    });
  }

  public interpret(statements: Stmt[]): void {
    try {
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        this.logger.runtimeError(err);
      }
    }
  }

  readonly visit: ExprVisitorMap<LiteralVal> & StmtVisitorMap<void> = {
    visitBlockStmt: (stmt: Block) =>
      this.executeBlock(stmt.statements, new Environment(this.environment)),

    visitBinaryExpr: (expr: Binary) => {
      const left = this.evaluate(expr.left);
      const right = this.evaluate(expr.right);

      switch (expr.op.type) {
        case TokenType.GREATER:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left > <number>right;
        case TokenType.GREATER_EQUAL:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left >= <number>right;
        case TokenType.LESS:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left < <number>right;
        case TokenType.LESS_EQUAL:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left <= <number>right;
        case TokenType.BANG_EQUAL:
          return !this.isEqual(left, right);
        case TokenType.EQUAL_EQUAL:
          return this.isEqual(left, right);
        case TokenType.MINUS:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left - <number>right;
        case TokenType.SLASH:
          this.checkNumberOperands(expr.op, left, right);

          if (right === 0) {
            throw new RuntimeError(expr.op, 'Division by 0.');
          }

          return <number>left / <number>right;
        case TokenType.STAR:
          this.checkNumberOperands(expr.op, left, right);
          return <number>left * <number>right;
        case TokenType.PLUS:
          if (left === null || right === null) {
            throw new RuntimeError(expr.op, "Can't sum nil values.");
          }

          if (typeof left === 'number' && typeof right === 'number') {
            return left + right;
          }

          if (typeof left === 'string' || typeof right === 'string') {
            return left.toString() + right.toString();
          }

          throw new RuntimeError(
            expr.op,
            'Operands must be two numbers or at least one of them should be string'
          );
      }

      return null;
    },
    visitCallExpr: (expr: Call) => {
      const callee = this.evaluate(expr.callee);

      const args: LiteralVal[] = expr.args.map((arg) => this.evaluate(arg));

      if (!isLoxCallable(callee)) {
        throw new RuntimeError(
          expr.paren,
          'Can only call functions and classes.'
        );
      }

      if (args.length != callee.arity()) {
        throw new RuntimeError(
          expr.paren,
          `Expected ${callee.arity()} arguments but got ${args.length}.`
        );
      }

      return callee.call(this, args);
    },
    visitUnaryExpr: (expr: Unary) => {
      const right = this.evaluate(expr.right);

      switch (expr.op.type) {
        case TokenType.BANG:
          return !this.isTruthy(right);
        case TokenType.MINUS:
          this.checkNumberOperand(expr.op, right);
          return -(<number>right);
      }

      return null;
    },
    visitLiteralExpr: (expr: Literal) => expr.val,
    visitLogicalExpr: (expr: Logical) => {
      const left = this.evaluate(expr.left);

      if (expr.op.type === TokenType.OR) {
        if (this.isTruthy(left)) return left;
      } else {
        if (!this.isTruthy(left)) return left;
      }

      return this.evaluate(expr.right);
    },
    visitGroupingExpr: (expr: Grouping) => this.evaluate(expr.expr),
    visitVariableExpr: (expr: Variable) => this.lookUpVariable(expr.name, expr),
    visitPrintStmt: (stmt: Print) =>
      stdout.write(`${this.stringify(this.evaluate(stmt.expr))}\n`),
    visitReturnStmt: (stmt: Return) => {
      let value: LiteralVal = null;
      if (stmt.value !== null) value = this.evaluate(stmt.value);

      throw new ReturnException(value);
    },
    visitExpressionStmt: (stmt: Expression) => this.evaluate(stmt.expr),
    visitFuncStmt: (stmt: Func) => {
      const func = new LoxFunction(stmt, this.environment);
      this.environment.define(stmt.name.lexeme, func);
    },
    visitIfStmt: (stmt: If) => {
      if (this.isTruthy(this.evaluate(stmt.condition))) {
        this.execute(stmt.thenBranch);
      } else if (stmt.elseBranch !== null) {
        this.execute(stmt.elseBranch);
      }
    },
    visitVarStmt: (stmt: Var) => {
      let value: LiteralVal = null;
      if (stmt.initializer != null) {
        value = this.evaluate(stmt.initializer);
      }

      this.environment.define(stmt.name.lexeme, value);
    },
    visitWhileStmt: (stmt: While) => {
      while (this.isTruthy(this.evaluate(stmt.condition))) {
        this.execute(stmt.body);
      }
    },
    visitAssignExpr: (expr: Assign) => {
      const value = this.evaluate(expr.value);

      const distance = this.locals.get(expr);
      if (distance !== undefined) {
        this.environment.assignAt(distance, expr.name, value);
      } else {
        this.globals.assign(expr.name, value);
      }

      return value;
    },
  };

  private evaluate(expr: Expr): LiteralVal {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  public resolve(expr: Expr, depth: number): void {
    this.locals.set(expr, depth);
  }

  public executeBlock(statements: Stmt[], environment: Environment): void {
    const prev = this.environment;

    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = prev;
    }
  }

  private isTruthy(val: LiteralVal): boolean {
    if (val === null) return false;
    if (typeof val === 'boolean') return val;
    return true;
  }

  private isEqual(left: LiteralVal, right: LiteralVal): boolean {
    return left === right;
  }

  private checkNumberOperand(operator: IToken, operand: LiteralVal): void {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(
    operator: IToken,
    left: LiteralVal,
    right: LiteralVal
  ): void {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  private stringify(val: LiteralVal): string {
    if (val === null) return 'nil';

    if (typeof val === 'number') {
      let text = val.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return val.toString();
  }

  private lookUpVariable(name: IToken, expr: Expr): LiteralVal {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }
}
