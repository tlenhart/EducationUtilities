import Dexie, { DexieError, DexieErrors } from 'dexie';

export interface DexieResult<T> {
  result: T;
  error?: DexieError,
}

export const DbErrors: DexieErrors = Dexie.errnames;

// export function buildDexieResult<T>(result: T): DexieResult<T>;
export function buildDexieResult<T>(result: T, e?: Pick<DexieError, 'message'> | DexieError): DexieResult<T>;
export function buildDexieResult<T>(result: T, e: unknown): DexieResult<T>;
export function buildDexieResult<T>(result: T, e?: unknown): DexieResult<T> {
  if (!e) {
    return { result: result };
  } else {
    return { result: result, error: e as DexieError };
  }
}

export class DexieResult2<T, E extends Error = DexieError> {
  public readonly result: T;
  public readonly error?: E;

  constructor(result: T, error?: E) {
    this.result = result;
    this.error = error;
  }

  public static fromResult<TResult>(result: TResult): DexieResult2<TResult> {
    return new DexieResult2<TResult>(result);
  }

  public static buildDexieResultFromDexieError<TResult>(result: TResult, e: Pick<DexieError, 'message'> | DexieError): DexieResult2<TResult, DexieError> {
    return new DexieResult2<TResult, DexieError>(result, e as DexieError);
  }

  public static buildDexieResult<TResult>(result: TResult, e: unknown): DexieResult2<TResult, DexieError> {
    return new DexieResult2<TResult, DexieError>(result, e as DexieError);
  }

  public static buildDexieResultError<TResult, TError extends Error>(result: TResult, e: TError): DexieResult2<TResult, TError> {
    return new DexieResult2<TResult, TError>(result, e);
  }

  public static fromErrorMessage<TResult>(result: TResult, errorMessage: string): DexieResult2<TResult, DexieError> {
    return DexieResult2.buildDexieResultFromDexieError(result, { message: errorMessage });
  }
}
