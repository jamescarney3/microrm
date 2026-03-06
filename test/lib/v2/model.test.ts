import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon from 'sinon';

import Model, { prop, key, belongsTo, hasMany, hasOne } from '~/lib/v2/model';
import Store from '~/lib/v2/store';

describe('Model class', () => {
  describe('::create', () => {
    beforeEach(() => {
      sinon.stub(Store, 'all').returns({ add: sinon.stub() });
    });

    afterEach(() => {
      Store.all.restore();
    });

    it('instatiates and returns an instance', () => {
      class Foo extends Model {}
      const foo = Foo.create();
      expect(foo).toBeTruthy();
    });

    it('assigns prop attributes to model instance', () => {
      class Bar extends Model {
        @prop declare baz: number;
        @prop declare qux: number;
      }
      const bar = Bar.create({ baz: 1, qux: 2 });
      expect(bar.baz).toBe(1);
      expect(bar.qux).toBe(2);
    });

    it('assigns association attributes to a model instance', () => {
      class Foo extends Model {
        @belongsTo('bars', { foreignKey: 'barId' }) declare bar;
      }

      class Bar extends Model {}
      const bar = new Bar();

      Store.all.returns({ get: () => bar, add: sinon.stub() });
      const foo = Foo.create({ bar: bar });

      expect(foo.bar).toBe(bar);
    });
  });

  describe('::all', () => {
    it('returns store collection for model', () => {
      class Foo extends Model {}
      Foo.meta.storeKey = 'foos';

      sinon.stub(Store, 'all').withArgs('foos').returns('foo collection');
      expect(Foo.all).toBe('foo collection');
      Store.all.restore();
    });

    it('throws an error if store key is unset', () => {
      class FooWithoutKey extends Model {}

      expect(() => FooWithoutKey.all).toThrowError();
    });
  });

  describe('::where', () => {
    it('returns a store collection matching parameters', () => {
      class Foo extends Model {}
      Foo.meta.storeKey = 'foos';

      const params = { foo: 'bar' };

      sinon.stub(Store, 'all').returns({
        where: sinon.stub().withArgs(params).returns('matching foos'),
      });

      expect(Foo.where(params)).toBe('matching foos');
      Store.all.restore();
    });
  });

  describe('#delete', () => {
    it('removes the instance from the store collection', () => {
      class TestModel extends Model {}
      const instance = new TestModel() as TestModel;

      sinon.stub(Store, 'all').returns([instance]);

      instance.delete();

      expect(Store.all('test-models').length).toBe(0);
      expect(Store.all('test-models').includes(instance)).toBe(false);
      Store.all.restore();
    });
  });

  describe('@prop property decorator', () => {
    it('defines an accessor on a model instance', () => {
      class Foo extends Model {
        @prop declare bar: string;
      }

      const foo = new Foo();
      foo.bar = 'baz';
      expect(foo.bar).toBe('baz');
    });
  });

  describe('@key property decorator', () => {
    it('defines a key prop on a model instance', () => {
      class Foo extends Model {
        @key declare bar: string;
      }

      const foo = new Foo();
      foo.bar = 'baz';
      expect(foo.bar).toBe('baz');
      expect(Foo.primaryKey).toBe('bar');
    });

    it('does not allow multiple keys', () => {
      const declareClassWithTwoKeys = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class Foo extends Model {
          @key declare bar: string;
          @key declare baz: string;
        }
      };
      expect(declareClassWithTwoKeys).toThrowError();
    });
  });

  describe('@belongsTo property decorator', () => {
    it('defines an association accessor', () => {
      class Foo extends Model {
        @belongsTo('bars', { foreignKey: 'barId' }) declare bar;
      }

      class Bar extends Model {}

      const foo = new Foo();
      const bar = new Bar();
      bar.id = 1;

      sinon
        .stub(Store, 'all')
        .withArgs('bars')
        .returns({
          get: sinon.stub().withArgs(1).returns(bar),
        });

      foo.bar = bar;
      expect(foo.bar).toBe(bar);
      Store.all.restore();
    });
  });

  describe('@hasOne property decorator', () => {
    it('defines an association accessor', () => {
      class Foo extends Model {
        @hasOne('bars', { foreignKey: 'fooId' }) declare bar;
      }

      class Bar extends Model {}

      const foo = new Foo();
      const bar = new Bar();
      bar.fooId = 1;

      sinon
        .stub(Store, 'all')
        .withArgs('bars')
        .returns({
          findBy: sinon.stub().returns(bar),
        });

      foo.bar = bar;
      expect(foo.bar).toBe(bar);
      Store.all.restore();
    });
  });

  describe('@hasMany property decorator', () => {
    it('defines an association accessor', () => {
      class Foo extends Model {
        @hasMany('bars', { foreignKey: 'fooId' }) declare bars;
      }

      class Bar extends Model {}

      const foo = new Foo();
      const bar1 = new Bar();
      const bar2 = new Bar();
      const bar3 = new Bar();
      foo.id = 1;

      foo.bars = [bar1, bar2, bar3];

      sinon
        .stub(Store, 'all')
        .withArgs('bars')
        .returns({
          where: sinon.stub().returns([bar1, bar2, bar3]),
        });

      expect(foo.bars).toStrictEqual([bar1, bar2, bar3]);
      Store.all.restore();
    });
  });
});
