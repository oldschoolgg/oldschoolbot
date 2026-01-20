export type AnyArr<T> = readonly T[] | T[];
export type Lit<S> = S extends string ? (string extends S ? never : S) : never;
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Simplify<T> = { [K in keyof T]: T[K] } & {};
export type ToObj<T> = [T] extends [never] ? {} : T;

export type { RNGProvider } from '@oldschoolgg/rng';
