import { transform, singularize } from 'inflection';
import Observer from '~/lib/v2/observer';

import Store from '~/lib/v3/store';
import Model from '~/lib/v3/model';

type RelationOptions = { foreignKey?: string; relationCollectionKey?: string };

const deriveRelationCollectionKey = (relationName: string, options: { override?: string } = {}): string => {
  // override always takes precedence if present
  const { override } = options;
  if (override) return override;

  // TODO: look up collection key transformations on store metadata when modeled, use these defaults for now
  return transform(relationName, ['tableize', 'dasherize']);
};

const deriveForeignKey = (propName: string, options: { override?: string } = {}) => {
  // override always takes precedence if present
  const { override } = options;
  if (override) return override;

  // TODO: look up key prop name on store metadata when modeled, use default 'Id' for now
  // TODO: look up prop case transformation on store metadata when modeled, use [] for now
  return transform(propName + 'Id', []);
};

const deriveRelationForeignKey = (modelInstance: Model, options: { override?: string } = {}): string => {
  const { override } = options;
  if (override) return override;

  const keyString = 'Id'; // TODO: make this customizable store metadata and look up from there
  const ModelClass = <typeof Model>modelInstance.constructor;
  return singularize(ModelClass.meta.storeKey) + keyString;
};

function defineBelongsToProperty(
  target: Model,
  propName: string,
  options: { foreignKey?: string; relationCollectionKey?: string } = {},
) {
  Object.defineProperty(target, propName, {
    get: function (): Model | undefined {
      const relationCollectionKey = deriveRelationCollectionKey(propName, { override: options.relationCollectionKey });
      const foreignKey = deriveForeignKey(propName, { override: options.foreignKey });
      return Store.all(relationCollectionKey).get(this[foreignKey]);
    },
    set: function (value?: Model): void {
      const foreignKey = deriveForeignKey(propName, { override: options.foreignKey });

      // unset foreign key
      delete this[foreignKey];

      // set foreign key if passed model instance arg exists
      this[foreignKey] = value?.keyOrTemporaryKey;

      Observer.notify(this);
    },
  });
}

export function belongsTo(options: RelationOptions): (target: Model, propName: string) => void;
export function belongsTo(target: Model, propName: string): void;
export function belongsTo(
  optionsOrTarget: RelationOptions | Model,
  propName?: string,
): void | ((target: Model, propName: string) => void) {
  if (optionsOrTarget instanceof Model) {
    // DECORATOR when invoked with no arguments; act on target and specified prop
    const target = optionsOrTarget as Model;
    const ModelClass = target.constructor as typeof Model;
    ModelClass.meta.relations.push(propName);
    defineBelongsToProperty(target, propName!);
  } else {
    // DECORATOR FACTORY when invoked with options hash; return decorator that acts on target and specified prop
    const options = optionsOrTarget as RelationOptions;
    return (target: Model, propName: string): void => {
      const ModelClass = target.constructor as typeof Model;
      ModelClass.meta.relations.push(propName);
      defineBelongsToProperty(target, propName, options);
    };
  }
}

function defineHasOneProperty(
  target: Model,
  propName: string,
  options: { foreignKey?: string; relationKey?: string } = {},
) {
  Object.defineProperty(target, propName, {
    get: function (): Model | undefined {
      const relationCollectionKey = deriveRelationCollectionKey(propName, { override: options.relationKey });
      const relationForeignKey = deriveRelationForeignKey(this, { override: options.foreignKey });
      return Store.all(relationCollectionKey).find((element) => element[relationForeignKey] === this.keyOrTemporaryKey);
    },
    set: function (value?: Model): void {
      const relationCollectionKey = deriveRelationCollectionKey(propName, { override: options.relationKey });
      const relationForeignKey = deriveRelationForeignKey(this, { override: options.foreignKey });

      // unset any existing foreign keys
      Store.all(relationCollectionKey)
        .filter((model) => model[relationForeignKey] === this.keyOrTemporaryKey)
        .forEach((model) => delete model[relationForeignKey]);

      // set foreign key on passed model instance arg if it exists
      if (value) value[relationForeignKey] = this.keyOrTemporaryKey;

      Observer.notify(this);
    },
  });
}

export function hasOne(options: RelationOptions): (target: Model, propName: string) => void;
export function hasOne(target: Model, propName: string): void;
export function hasOne(
  optionsOrTarget: RelationOptions | Model,
  propName?: string,
): void | ((target: Model, propName: string) => void) {
  if (optionsOrTarget instanceof Model) {
    // DECORATOR when invoked with no arguments; act on target and specified prop
    const target = optionsOrTarget as Model;
    const ModelClass = target.constructor as typeof Model;
    ModelClass.meta.relations.push(propName);
    defineHasOneProperty(target, propName!);
  } else {
    // DECORATOR FACTORY when invoked with options hash; return decorator that acts on target and specified prop
    const options = optionsOrTarget as RelationOptions;
    return (target: Model, propName: string): void => {
      const ModelClass = target.constructor as typeof Model;
      ModelClass.meta.relations.push(propName);
      defineHasOneProperty(target, propName, options);
    };
  }
}

function defineHasManyProperty(
  target: Model,
  propName: string,
  options: { foreignKey?: string; relationKey?: string } = {},
) {
  Object.defineProperty(target, propName, {
    get: function (): Model[] {
      const relationCollectionKey = deriveRelationCollectionKey(propName, { override: options.relationKey });
      const relationForeignKey = deriveRelationForeignKey(this, { override: options.foreignKey });

      return Store.all(relationCollectionKey).filter(
        (element) => element[relationForeignKey] === this.keyOrTemporaryKey,
      );
    },
    set: function (values: Model[] = []): void {
      const relationCollectionKey = deriveRelationCollectionKey(propName, { override: options.relationKey });
      const relationForeignKey = deriveRelationForeignKey(this, { override: options.foreignKey });

      // unset all current foreign keys
      Store.all(relationCollectionKey)
        .filter((model) => model[relationForeignKey] === this.keyOrTemporaryKey)
        .forEach((model) => delete model[relationForeignKey]);

      // set foreign keys on all passed in instances
      (values || []).forEach((model) => {
        model[relationForeignKey] = this.keyOrTemporaryKey;
      });

      Observer.notify(this);
    },
  });
}

export function hasMany(options: RelationOptions): (target: Model, propName: string) => void;
export function hasMany(target: Model, propName: string): void;
export function hasMany(
  optionsOrTarget: RelationOptions | Model,
  propName?: string,
): void | ((target: Model, propName: string) => void) {
  if (optionsOrTarget instanceof Model) {
    // DECORATOR when invoked with no arguments; act on target and specified prop
    const target = optionsOrTarget as Model;
    const ModelClass = target.constructor as typeof Model;
    ModelClass.meta.relations.push(propName);
    defineHasManyProperty(target, propName!);
  } else {
    // DECORATOR FACTORY when invoked with options hash; return decorator that acts on target and specified prop
    const options = optionsOrTarget as RelationOptions;
    return (target: Model, propName: string): void => {
      const ModelClass = target.constructor as typeof Model;
      ModelClass.meta.relations.push(propName);
      defineHasManyProperty(target, propName, options);
    };
  }
}
