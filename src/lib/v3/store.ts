import Collection from '~/lib/v3/collection';
import type Model from '~/lib/v3/model';

// NB: possible use case for a Store.all('some-key'): Collection<Model> method, but maybe better
// abstracted as ModelDescendent.all() to elide need for generics
class Store {
  // nothing should ever be instantiating and instance of this or accessing the singleton
  // instance, so privatize these
  private constructor() {}
  static #instance: Store;

  static get instance(): Store {
    if (!Store.#instance) Store.#instance = new Store();
    return Store.#instance;
  }

  // store data lives here relational lists; this is meant to mirror a relational database with
  // notes of ActiveRecord
  _data: Record<string, Collection<Model>> = {};

  static all<T extends Model = Model>(key: string): Collection<T> {
    return Store.instance._data[key] as Collection<T>;
  }
}

export function register(storeKey: string) {
  return (modelClass: typeof Model) => {
    const { _data } = Store.instance;
    const { meta } = modelClass;

    if (_data[storeKey]) throw new Error(`duplicate store key ${storeKey} not allowed`);

    _data[storeKey] = Collection.create([]);
    meta.storeKey = storeKey;
  };
}

export default Store;
