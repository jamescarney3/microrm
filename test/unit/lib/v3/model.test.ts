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
      vi.mocked(Store.all).mockReturnValueOnce({ push: mockPush } as unknown as Collection<Model>);

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
        (key: string) => (key === 'foos' ? 'foo collection' : 'something else') as unknown as Collection<Model>,
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
              (params.foo === 'bar' ? 'matching foos' : 'something else') as unknown as Collection<Model>,
          } as unknown as Collection<Model>;
        return {} as unknown as Collection<Model>;
      });

      expect(Foo.where(whereParams)).toBe('matching foos');
    });
  });

  describe('#delete', () => {
    it('deletes mdoel instance from its store', () => {
      class Foo extends Model {}
      Foo.meta.storeKey = 'foos';

      const mockCollection = { delete: vi.fn() };
      vi.mocked(Store.all).mockImplementationOnce((key: string) => {
        if (key === 'foos') return mockCollection as unknown as Collection<Foo>;
        return {} as unknown as Collection<Foo>;
      });

      const foo = new Foo();
      foo.delete();

      expect(mockCollection.delete).toHaveBeenCalledWith(foo);
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
      expect(foo.keyOrTemporaryKey).toBe('baz');
    });
  });
});
