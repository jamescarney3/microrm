import { v4 as uuidV4 } from 'uuid';

import Store from '~/lib/v3/store';
import type Collection from '~/lib/v3/collection';
import Observer from '~/lib/v3/observer';

const BASE_MODEL_METADATA = {
  key: <string>'id',
  storeKey: <string | null>null,
  props: <string[]>[],
  relations: <string[]>[],
};
Object.freeze(BASE_MODEL_METADATA);

const assignProps = (model: Model, props: Record<string, unknown> = {}): void => {
  const ModelClass = model.constructor as typeof Model;
  const propNames = ModelClass.meta.props;

  Object.keys(props)
    .filter((propName) => propNames.includes(propName))
    .forEach((propName) => (model[propName] = props[propName]));
};

const assignRelations = (model: Model, props: Record<string, unknown> = {}): void => {
  const ModelClass = model.constructor as typeof Model;
  const relationNames = ModelClass.meta.relations;

  Object.keys(props)
    .filter((propName) => relationNames.includes(propName))
    .forEach((propName) => (model[propName] = props[propName]));
};

function defineModelField(target: Model, propName: string): void {
  const backingField = `_${propName}`;

  Object.defineProperty(target, propName, {
    get: function () {
      return this[backingField];
    },
    set: function (value) {
      this[backingField] = value;
      Observer.notify(this);
    },
    configurable: true,
  });
}

export function prop(target: Model, propName: string): void {
  const ModelClass = target.constructor as typeof Model;
  ModelClass.meta.props.push(propName);
  defineModelField(target, propName);
}

export function key(target: Model, propName: string): void {
  const ModelClass = target.constructor as typeof Model;
  ModelClass.meta.props.push(propName);
  ModelClass.meta.key = propName;
}

// TODO: consider unifying static create and constructor
export default class Model {
  private static _meta = new Map();

  [key: string]: unknown;
  declare _temporaryKey: string;

  constructor() {
    this._temporaryKey = uuidV4();
  }

  // this can't just be a static prop, otherwise descendents will clobber the Model static var;
  // instead, use a private static property _meta on the base class and patch it with an entry
  // for each descendent class when first accessed and make descendent class static var return
  // the entry value
  // https://thecodebarbarian.com/static-properties-in-javascript-with-inheritance.html
  static get meta() {
    if (!this._meta.has(this)) {
      this._meta.set(this, structuredClone(BASE_MODEL_METADATA));
    }
    return this._meta.get(this);
  }

  static get all(): Collection<Model> {
    return Store.all(this.meta.storeKey);
  }

  static where(attributes: Record<string, unknown>): Collection<Model> {
    return Store.all(this.meta.storeKey).where(attributes);
  }

  static create<T extends typeof Model>(this: T, props: Record<string, unknown> = {}): InstanceType<T> {
    const storeKey = this.meta.storeKey;
    const instance = new this();

    assignProps(instance, props);
    assignRelations(instance, props);

    Store.all(storeKey).push(instance);
    Observer.notify(this);
    return instance as InstanceType<T>;
  }

  get keyOrTemporaryKey(): string {
    const ModelClass = <typeof Model>this.constructor;
    const key = ModelClass.meta.key;

    return <string>this[key] || this._temporaryKey;
  }

  // TODO: unset for properties?
  // unset(propName: [[something from constructor meta props??]]): void {
  //   delete from instance
  //   notify observer
  // }

  delete() {
    const metadata = (this.constructor as typeof Model).meta;
    const collection = Store.all(metadata.storeKey);
    const record = collection.delete(this);
    Observer.notify(this);
    return record;
  }
}
