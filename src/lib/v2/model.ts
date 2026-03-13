import Store from '~/lib/v2/store';
import Observer from '~/lib/v2/observer';
import type Collection from '~/lib/v2/collection';

interface ModelBase extends Model {
  [key: string]: unknown;
}

const BASE_METADATA = {
  props: <string[]>[],
  associations: <string[]>[],
  key: <null | string>null,
  customKeySet: false,
  storeKey: '',
};
Object.freeze(BASE_METADATA);

function setProp(target: Model, propName: string): void {
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

  setProp(target, propName);
}

export function key(target: Model, propName: string): void {
  const ModelClass = target.constructor as typeof Model;
  if (ModelClass.meta.customKeySet) {
    throw new Error('Multiple custom keys not allowed');
  }

  ModelClass.meta.customKeySet = true;
  ModelClass.meta.key = propName;

  prop(target, propName);
}

type RelationOptionsSignature = {
  foreignKey: string;
};

export function belongsTo(relationName: string, options: RelationOptionsSignature) {
  return (target: Model, propName: string): void => {
    const ModelClass = target.constructor as typeof Model;
    ModelClass.meta.associations.push(propName);
    const { foreignKey } = <{ foreignKey: keyof Model }>options;

    Object.defineProperty(target, propName, {
      get: function (): Model | undefined {
        return Store.all(relationName).get(this[foreignKey]);
      },
      set: function (value: Model): void {
        const RelationModelClass = <typeof Model>value.constructor;
        const key = <keyof Model>RelationModelClass.primaryKey;
        this[foreignKey] = value[key];
        Observer.notify(this);
      },
      configurable: true,
    });
  };
}

export function hasOne(relationName: string, options: RelationOptionsSignature) {
  return (target: Model, propName: string): void => {
    const ModelClass = <typeof Model>target.constructor;
    ModelClass.meta.associations.push(propName);
    const { foreignKey } = <{ foreignKey: keyof Model }>options;
    const primaryKey = <keyof Model>ModelClass.primaryKey;

    Object.defineProperty(target, propName, {
      get: function (): Model | undefined {
        return Store.all(relationName).findBy((model) => model[foreignKey] === this[primaryKey]);
      },
      set: function (value: Model): void {
        value[foreignKey] = (<Model>this)[primaryKey];
        Observer.notify(this);
      },
      configurable: true,
    });
  };
}

export function hasMany(relationName: string, options: RelationOptionsSignature) {
  return (target: Model, propName: string): void => {
    const ModelClass = <typeof Model>target.constructor;
    const { foreignKey } = <{ foreignKey: keyof Model }>options;

    Object.defineProperty(target, propName, {
      get: function (): Collection<Model> {
        const ModelClass = <typeof Model>target.constructor;
        const primaryKey = <keyof Model>ModelClass.primaryKey;
        return Store.all(relationName).where({ [foreignKey]: this[primaryKey] });
      },
      set: function (values: Collection<Model>): void {
        const primaryKey = <keyof Model>ModelClass.primaryKey;
        for (const value of values) {
          value[foreignKey] = this[primaryKey];
        }
        Observer.notify(this);
      },
      configurable: true,
    });
  };
}

type ModelAttributes = Record<string, unknown>;
// TODO: static nextId method for non-custom key subclasses

export default class Model {
  private static _meta = new Map();

  delete() {
    const metadata = (this.constructor as typeof Model).meta as typeof BASE_METADATA;
    const collection = Store.all(metadata.storeKey);
    const idx = collection.indexOf(this);
    collection.splice(idx, 1);
    Observer.notify(this);
  }

  // this can't be a static prop, otherwise descendents will clobber the Model static var
  // https://thecodebarbarian.com/static-properties-in-javascript-with-inheritance.html
  static get meta(): typeof BASE_METADATA {
    if (!this._meta.has(this)) {
      this._meta.set(this, { ...BASE_METADATA, props: [...BASE_METADATA.props] });
    }
    return this._meta.get(this);
  }

  static get primaryKey(): string | null {
    return this.meta.key;
  }

  static get props() {
    return this.meta.props;
  }

  static get associations() {
    return this.meta.associations;
  }

  static get storeKey() {
    if (!this.meta.storeKey) {
      throw new Error(`Model ${this.constructor.name} storeKey not set`);
    }
    return this.meta.storeKey;
  }

  static get all(): Collection<Model> {
    return Store.all(this.storeKey);
  }

  static where(attributes: Record<string, unknown>): Collection<Model> {
    return this.all.where(attributes);
  }

  static create(attributes: ModelAttributes) {
    // declare a fresh instance and assign whitelist of attributes
    const instance = new this() as ModelBase;

    for (const propName of this.props) {
      if (propName in instance && instance[propName] === undefined) {
        const value = instance[propName];
        delete instance[propName];
        setProp(instance, propName);
        instance[propName] = value;
      }
      if (propName in attributes) {
        instance[propName] = attributes[propName];
      }
    }

    for (const association of this.associations) {
      if (association in attributes) {
        instance[association] = attributes[association];
      }
    }

    Store.all(this.meta.storeKey).add(instance as Model);
    Observer.notify(this);
    return instance as Model;
  }
}
