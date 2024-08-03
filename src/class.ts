import { LoxCallable } from '@/callable';
import { Interpreter } from '@/interpreter';
import { LiteralVal } from '@/types/token';
import { LoxInstance } from '@/instance';
import { LoxFunction } from '@/function';

export class LoxClass implements LoxCallable {
  public readonly name: string;
  private readonly methods: Map<string, LoxFunction>;
  public readonly superclass: LoxClass | null;

  constructor(
    name: string,
    superclass: LoxClass | null,
    methods: Map<string, LoxFunction>
  ) {
    this.name = name;
    this.methods = methods;
    this.superclass = superclass;
  }

  public call(interpreter: Interpreter, args: LiteralVal[]): LiteralVal {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod('init');
    if (initializer !== undefined) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  public findMethod(name: string): LoxFunction | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return undefined;
  }

  public toString(): string {
    return this.name;
  }

  public arity(): number {
    const initializer = this.findMethod('init');
    if (initializer === undefined) return 0;
    return initializer.arity();
  }
}
