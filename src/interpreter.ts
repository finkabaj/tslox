import {
  Assign,
  Binary,
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
  If,
  Print,
  Stmt,
  StmtVisitor,
  StmtVisitorMap,
  Var,
} from '@/stmt';
import { Environment } from '@/environment';

export class Interpreter implements ExprVisitor<LiteralVal>, StmtVisitor<void> {
  private environment = new Environment();

  constructor(private readonly logger: ILogger) {}

  public interpret(statements: Stmt[]): void {
    try {
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } catch (err) {
      this.logger.runtimeError(err as RuntimeError);
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
            throw new RuntimeError(expr.op, 'Can not sum nil values.');
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
    visitVariableExpr: (expr: Variable) => this.environment.get(expr.name),
    visitPrintStmt: (stmt: Print) =>
      stdout.write(`${this.stringify(this.evaluate(stmt.expr))}\n`),
    visitExpressionStmt: (stmt: Expression) => this.evaluate(stmt.expr),
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
    visitAssignExpr: (expr: Assign) => {
      const value = this.evaluate(expr.value);
      this.environment.assign(expr.name, value);
      return value;
    },
  };

  private evaluate(expr: Expr): LiteralVal {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  private executeBlock(statements: Stmt[], environment: Environment): void {
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
}
