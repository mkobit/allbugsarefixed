/* eslint-disable functional/no-loop-statements */
/* eslint-disable functional/no-let */

/**
 * Functional utility for lazy iteration over arrays and other iterables.
 * Uses Array.prototype.values() for arrays to ensure lazy traversal.
 */

export function lazyValues<T>(source: readonly T[] | Iterable<T>): Iterator<T> {
  if (Array.isArray(source)) {
    return source.values();
  }
  if (Symbol.iterator in source) {
    return (source as Iterable<T>)[Symbol.iterator]();
  }
  // Fallback to empty iterator instead of throwing if strictly functional,
  // but for utility it's better to fail fast or return empty.
  // Returning empty iterator for safety.
  return [][Symbol.iterator]();
}

export function* lazyMap<T, U>(
  source: readonly T[] | Iterable<T>,
  mapFn: (item: T) => U
): Generator<U> {
  const iterator = lazyValues(source);
  let next = iterator.next();
  while (!next.done) {
    yield mapFn(next.value);
    next = iterator.next();
  }
}

export function* lazyFilter<T>(
  source: readonly T[] | Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T> {
  const iterator = lazyValues(source);
  let next = iterator.next();
  while (!next.done) {
    if (predicate(next.value)) {
      yield next.value;
    }
    next = iterator.next();
  }
}
