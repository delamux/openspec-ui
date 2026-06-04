export class Maybe<T> {
  private constructor(private readonly value: T | null) {}

  static some<T>(value: T): Maybe<T> {
    return new Maybe<T>(value);
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  static fromNullable<T>(value: T | null | undefined): Maybe<T> {
    return value === null || value === undefined ? Maybe.none<T>() : Maybe.some<T>(value);
  }

  isSome(): boolean {
    return this.value !== null;
  }

  isNone(): boolean {
    return this.value === null;
  }

  fold<R>(onNone: () => R, onSome: (value: T) => R): R {
    return this.value === null ? onNone() : onSome(this.value);
  }

  map<R>(transform: (value: T) => R): Maybe<R> {
    return this.value === null ? Maybe.none<R>() : Maybe.some<R>(transform(this.value));
  }

  getOrElse(fallback: T): T {
    return this.value === null ? fallback : this.value;
  }

  getOrThrow(): T {
    if (this.value === null) {
      throw new Error('Called getOrThrow on a None value');
    }
    return this.value;
  }
}
