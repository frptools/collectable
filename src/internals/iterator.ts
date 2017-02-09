export class MappableIterator<T> implements IterableIterator<any> {
  private it: IterableIterator<T>;
  constructor(
    private iterable: Iterable<T>,
    private map: (value: T) => any
  ) {
    this.it = <IterableIterator<T>>this.iterable[Symbol.iterator]();
  }

  next(value?: any): IteratorResult<any> {
    var result = this.it.next(value);
    if(!result.done) result.value = this.map(result.value);
    return result;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }
}
