import Collection from '~/lib/v2/collection';
import Model from '~/lib/v2/model';

class Store {
  private constructor() {}

  static #instance: Store;

  static get instance(): Store {
    if (!Store.#instance) Store.#instance = new Store();
    return Store.#instance;
  }

  _data: Record<string, Collection<Model>> = {};

  static all<T extends Model>(key: string): Collection<T> {
    return Store.instance._data[key] as Collection<T>;
  }

  // static get<T extends Model>(key: string, id: keyof Model): T | undefined {
  //   return (<Collection<T>>Store.instance._data[key]).get(id);
  // }
}

export function register(storeKey: string) {
  return (modelClass: typeof Model) => {
    const { _data } = Store.instance;
    const { meta } = modelClass;

    if (_data[storeKey]) throw new Error('duplicate store key not allowed');

    _data[storeKey] = Collection.create([], { key: meta.key });
    meta.storeKey = storeKey;
  };
}

export default Store;
