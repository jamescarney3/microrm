import type Model from '~/lib/v3/model';

export type CollectionOptions = {
  key: string | null;
};

// TODO: generic key collision detection algo either in separate function or instance method?

// pseudo-keyed array to store and provide a relational list of Model instances
export default class Collection extends Array {
  declare key: string;

  private constructor(data: Model[] = []) {
    if (!Array.isArray(data)) {
      // non-destructive array built-in methods (e.g. filter, map) call the constructor with a
      // single array length arg and then mutate the result; any consumer instantiating one of
      // these should pass it an iterable through the ::create method
      super(data);
    } else {
      // can't just spread data into here because of the way the constructor will instantiate a
      // blank array with a single argument, so instantiate the blank array anyway and then splice
      // the spread data arg into it
      super(data.length);
      this.splice(0, data.length, ...data);
    }
  }

  static create(data: Model[] = []) {
    return new Collection(data);
  }

  get(key: string | number): Model | undefined {
    return super.find((element) => element.keyOrTemporaryKey === key);
  }

  where(attributes: Record<string, unknown>): Collection {
    const props = Object.entries(attributes);
    return this.filter((element) => props.every(([key, val]) => element[key] === val)) as Collection;
  }

  findBy<Model>(predicate: (member: Model) => boolean): Model | undefined {
    return super.find(predicate);
  }

  slice(start?: number, end?: number): this {
    return super.slice(start, end) as this;
  }

  /* istanbul ignore start -- @preserve */
  // NB: this is for type hygeine; calling super and asserting the return type makes sure the compiler
  // knows we're getting back a Collection here instead of an Array instance
  filter(predicate: (value: Model, index: number, array: Model[]) => unknown, thisArg?: unknown): this {
    return super.filter(predicate, thisArg) as this;
  }

  sort(compareFn?: (a: Model, b: Model) => number): this {
    return super.sort(compareFn);
  }

  concat(...items: (Model | ConcatArray<Model>)[]): this {
    return super.concat(...items) as this;
  }
  /* istanbul ignore stop -- @preserve */

  get last(): Model | undefined {
    return this.slice(-1)[0] as Model | undefined;
  }

  get first(): Model | undefined {
    return this[0] as Model | undefined;
  }
}
