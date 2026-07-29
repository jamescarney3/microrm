import { afterEach, describe, expect, it } from 'vitest';

import Store, { register } from '~/lib/v3/store';

const cleanupStore = () => {
  Store.instance._data = {};
};

describe('Store class', () => {
  afterEach(cleanupStore);

  it('has a singleton instance', () => {
    // @ts-expect-error - need to ignore private constructor to assert this behavior
    class OtherStore extends Store {}

    expect(OtherStore.instance).toBe(Store.instance);
  });
});

describe('@register decorator', () => {
  afterEach(cleanupStore);

  it('registers a model collection on store instance', () => {
    // @ts-expect-error - unwieldy to assert this as a descendent of a mocked model
    @register('test-instances')
    // @ts-expect-error - vite doesn't like combining decorators with anonymous class declarations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Foo {
      static meta = { key: 'id' };
    }

    expect(Store.instance._data['test-instances']).toBeDefined();
  });

  it('does not register a collection with a duplicate store key', () => {
    const registerDuplicateModel = () => {
      // @ts-expect-error - unwieldy to assert this as a descendent of a mocked model
      @register('test-instances')
      // @ts-expect-error - vite doesn't like combining decorators with anonymous class declarations
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Foo {
        static meta = { key: 'id' };
      }
      // @ts-expect-error - unwieldy to assert this as a descendent of a mocked model
      @register('test-instances')
      // @ts-expect-error - vite doesn't like combining decorators with anonymous class declarations
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Bar {
        static meta = { key: 'id' };
      }
    };

    expect(registerDuplicateModel).toThrowError();
  });
});
