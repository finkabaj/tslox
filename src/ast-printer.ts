import {
  Binary,
  Expr,
  Unary,
  Grouping,
  Literal,
  ExprVisitor,
  ExprVisitorMap,
} from '@/expr';

export class AstPrinter implements ExprVisitor<string> {
  public print(expr: Expr): string {
    return expr.accept(this);
  }

  readonly visit: ExprVisitorMap<string> = {
    visitBinaryExpr: (expr: Binary) =>
      this.parenthesize(expr.op.lexeme, expr.left, expr.right),
    visitUnaryExpr: (expr: Unary) =>
      this.parenthesize(expr.op.lexeme, expr.right),
    visitLiteralExpr: (expr: Literal) => {
      if (!expr.val) {
        return 'nil';
      }

      return expr.val.toString();
    },
    visitGroupingExpr: (expr: Grouping) =>
      this.parenthesize('group', expr.expr),
  };

  private parenthesize(name: string, ...exprs: Expr[]) {
    return `(${name}${exprs.map((expr) => ` ${expr.accept(this)}`).join('')})`;
  }
}
