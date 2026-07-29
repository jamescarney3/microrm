import { describe, expect, it, vi } from 'vitest';

import Model, { prop, key } from '~/lib/v3/model';
import Store from '~/lib/v3/store';
import Collection from '~/lib/v3/collection';

vi.mock('~/lib/v3/store', () => ({
  default: {
    all: vi.fn().mockReturnValue({
      push: vi.fn(),
    }),
  },
}));

describe('Model class', () => {
  describe('::create', () => {
    it('instantiates and returns a model instance', () => {
      class Foo extends Model {}
      const foo = Foo.create();
      expect(foo instanceof Model).toBeTruthy();
    });

    it('adds the created instance to the store', () => {
      const mockPush = vi.fn();
      vi.mocked(Store.all).mockReturnValueOnce({ push: mockPush } as unknown as Collection);

      class Foo extends Model {}
      Foo.create();
      expect(mockPush).toHaveBeenCalled();
    });

    it('assigns prop and relation attributes to model instance', () => {
      class Bar extends Model {
        @prop declare baz: number;
        @prop declare qux: number;
      }

      const bar = Bar.create({ baz: 1, qux: 2 });
      expect(bar.baz).toBe(1);
      expect(bar.qux).toBe(2);
    });
  });

  describe('::all', () => {
    it('returns store collection for model', () => {
      vi.mocked(Store.all).mockImplementationOnce(
        (key: string) => (key === 'foos' ? 'foo collection' : 'something else') as unknown as Collection,
      );

      class Foo extends Model {}
      Foo.meta.storeKey = 'foos';

      expect(Foo.all).toBe('foo collection');
    });
  });

  describe('::where', () => {
    it('returns a store collection matching parameters', () => {
      class Foo extends Model {}
      Foo.meta.storeKey = 'foos';
      const whereParams = { foo: 'bar' };

      vi.mocked(Store.all).mockImplementationOnce((key: string) => {
        if (key === 'foos')
          return {
            where: (params: Record<string, unknown>) =>
              (params.foo === 'bar' ? 'matching foos' : 'something else') as unknown as Collection,
          } as unknown as Collection;
        return {} as unknown as Collection;
      });

      expect(Foo.where(whereParams)).toBe('matching foos');
    });
  });

  // describe('#delete', () => {
  //   // it('removes the instance from the store collection', () => {
  //   //   class TestModel extends Model {}
  //   //   const instance = new TestModel() as TestModel;
  //   //   const mockCollection = { delete: vi.fn() };
  //   //   sinon.stub(Store, 'all').returns(mockCollection);
  //   //   instance.delete();
  //   //   expect(mockCollection.delete).toHaveBeenCalledWith(instance);
  //   //   Store.all.restore();
  //   // });
  //   // it('deletes dependent associated instances', () => {
  //   //   const mockCollection = { delete: vi.fn() };
  //   //   sinon.stub(Store, 'all').returns(mockCollection);
  //   //   const mockBar = { delete: vi.fn() };
  //   //   const mockBazzes = [{ delete: vi.fn() }, { delete: vi.fn() }];
  //   //   class Foo extends Model {
  //   //     bar = {};
  //   //     bazzes = [];
  //   //   }
  //   //   const foo = new Foo();
  //   //   vi.spyOn(foo, 'bar', 'get').mockReturnValue(mockBar);
  //   //   vi.spyOn(foo, 'bazzes', 'get').mockReturnValue(mockBazzes);
  //   //   vi.spyOn(Foo.meta, 'dependents', 'get').mockReturnValue([
  //   //     { name: 'bar', association: 'hasOne', method: 'delete' },
  //   //     { name: 'bazzes', association: 'hasMany', method: 'delete' },
  //   //   ]);
  //   //   foo.delete();
  //   //   expect(mockBar.delete).toHaveBeenCalled();
  //   //   expect(mockBazzes[0].delete).toHaveBeenCalled();
  //   //   expect(mockBazzes[1].delete).toHaveBeenCalled();
  //   //   Store.all.restore();
  //   // });
  // });

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
      expect(foo.keyOrTemporaryKey).toBe('baz');
    });

    // it('does not allow multiple keys', () => {
    //   const declareClassWithTwoKeys = () => {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     class Foo extends Model {
    //       @key declare bar: string;
    //       @key declare baz: string;
    //     }
    //   };
    //   expect(declareClassWithTwoKeys).toThrowError();
    // });
  });
});
