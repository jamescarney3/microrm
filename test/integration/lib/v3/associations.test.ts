import { describe, it, expect, vi } from 'vitest';

import Store, { register } from '~/lib/v3/store';
import Model from '~/lib/v3/model';
import Observer from '~/lib/v2/observer';
import { belongsTo, hasOne, hasMany } from '~/lib/v3/associations';

describe('model association decorators', () => {
  // TODO: definitely reset store either before or after all of these
  describe('@hasOne and @belongsTo', () => {
    @register('foos')
    class Foo extends Model {
      @hasOne declare bar?: Bar;
    }

    @register('bars')
    class Bar extends Model {
      @belongsTo declare foo?: Foo;
      @hasOne declare bonk?: Bonk;
    }

    @register('bonks')
    class Bonk extends Model {
      @belongsTo declare bar?: Bar;
    }

    it('sets default reciprocal associations between models', () => {
      const bar = Bar.create();
      const foo = Foo.create();
      const bonk = Bonk.create();

      bar.foo = foo;
      bar.bonk = bonk;

      expect(bar.foo).toBe(foo);
      expect(foo.bar).toBe(bar);
      expect(bar.bonk).toBe(bonk);
      expect(bonk.bar).toBe(bar);
    });

    it('allows setting associations on model creation', () => {
      const foo = Foo.create();
      const bonk = Bonk.create();
      const bar = Bar.create({ foo, bonk });

      expect(bar.foo).toBe(foo);
      expect(foo.bar).toBe(bar);
      expect(bar.bonk).toBe(bonk);
      expect(bonk.bar).toBe(bar);
    });

    it('allows unsetting association between models', () => {
      const bar = Bar.create();
      const foo = Foo.create();
      const bonk = Bonk.create();

      bar.foo = foo;
      bar.bonk = bonk;
      bar.foo = undefined;
      bar.bonk = undefined;

      expect(bar.foo).not.toBe(foo);
      expect(foo.bar).not.toBe(bar);
      expect(bar.bonk).not.toBe(bonk);
      expect(bonk.bar).not.toBe(bar);
    });

    it('triggers observer notification on set', () => {
      const subscriber = vi.fn();
      Observer.subscribe(subscriber);

      const bar = Bar.create();
      const foo = Foo.create();
      const bonk = Bonk.create();

      bar.foo = foo;
      bar.bonk = bonk;
      bar.foo = undefined;
      bar.bonk = undefined;

      expect(subscriber).toHaveBeenCalledTimes(4);
      expect(bar.bonk).not.toBe(bonk);
      expect(bonk.bar).not.toBe(bar);
    });

    it('allows custom foreignKey override', () => {
      @register('bazzes')
      class Baz extends Model {
        @hasOne({ foreignKey: 'bazzerId', relationCollectionKey: 'quxes' }) declare qux: Qux;
      }

      @register('quxes')
      class Qux extends Model {
        @belongsTo({ foreignKey: 'bazzerId', relationCollectionKey: 'bazzes' }) declare baz: Baz;
        @hasOne({ foreignKey: 'quxKey', relationCollectionKey: 'garplies' }) declare garply: Garply;
      }

      @register('garplies')
      class Garply extends Model {
        @belongsTo({ foreignKey: 'quxKey', relationCollectionKey: 'quxes' }) declare qux: Qux;
      }

      const baz = Baz.create();
      const qux = Qux.create();
      const garply = Garply.create();

      qux.baz = baz;
      qux.garply = garply;

      expect(baz.qux).toBe(qux);
      expect(qux.baz).toBe(baz);
      expect(qux.garply).toBe(garply);
      expect(garply.qux).toBe(qux);
    });
  });

  describe('@hasMany and @belongsTo', () => {
    // reset the store
    Store.instance._data = {};

    @register('foos')
    class Foo extends Model {
      @hasMany declare bars: Bar[];
    }

    @register('bars')
    class Bar extends Model {
      @belongsTo declare foo?: Foo;
      @hasMany declare bonks: Bonk[];
    }

    @register('bonks')
    class Bonk extends Model {
      @belongsTo declare bar?: Bar;
    }

    it('sets default reciprocal associations between models', () => {
      const foo = Foo.create();
      const bar = Bar.create();
      const bonk = Bonk.create();

      foo.bars = [bar];
      bonk.bar = bar;

      expect(foo.bars).toContain(bar);
      expect(bar.foo).toBe(foo);
      expect(bar.bonks).toContain(bonk);
      expect(bonk.bar).toBe(bar);
    });

    it('allows setting associations on model creation', () => {
      const foo = Foo.create();
      const bonk = Bonk.create();
      const bar = Bar.create({ foo, bonks: [bonk] });

      expect(foo.bars).toContain(bar);
      expect(bar.foo).toBe(foo);
      expect(bar.bonks).toContain(bonk);
      expect(bonk.bar).toBe(bar);
    });

    it('allows unsetting association between models', () => {
      const bar = Bar.create();
      const foo = Foo.create();
      const bonk = Bonk.create();

      foo.bars = [bar];
      bonk.bar = bar;
      foo.bars = [];
      bonk.bar = undefined;

      expect(foo.bars).toHaveLength(0);
      expect(bar.foo).not.toBe(foo);
      expect(bar.bonks).toHaveLength(0);
      expect(bonk.bar).not.toBe(bar);
    });

    it('triggers observer notification on set', () => {
      const subscriber = vi.fn();
      Observer.subscribe(subscriber);

      const bar = Bar.create();
      const foo = Foo.create();
      const bonk = Bonk.create();

      bar.foo = foo;
      bar.bonks = [bonk];
      // bar.foo = null;
      bar.bonks = [];

      // expect(subscriber).toHaveBeenCalledTimes(4);
      expect(subscriber).toHaveBeenCalledTimes(3);
    });

    it('allows custom foreignKey override', () => {
      Store.instance._data = {};

      @register('bazzes')
      class Baz extends Model {
        @hasMany({ foreignKey: 'bazzerId', relationCollectionKey: 'quxes' }) declare quxes: Qux;
      }

      @register('quxes')
      class Qux extends Model {
        @belongsTo({ foreignKey: 'bazzerId', relationCollectionKey: 'bazzes' }) declare baz: Baz;
        @hasMany({ foreignKey: 'quxKey', relationCollectionKey: 'garplies' }) declare garplies: Garply[];
      }

      @register('garplies')
      class Garply extends Model {
        @belongsTo({ foreignKey: 'quxKey', relationCollectionKey: 'quxes' }) declare qux: Qux;
      }

      const baz = Baz.create();
      const qux = Qux.create();
      const garply = Garply.create();

      qux.baz = baz;
      qux.garplies = [garply];

      expect(baz.quxes).toContain(qux);
      expect(qux.baz).toBe(baz);
      expect(qux.garplies).toContain(garply);
      expect(garply.qux).toBe(qux);
    });
  });
});
