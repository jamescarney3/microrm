// @ts-nocheck
import { afterEach, describe, expect, it } from 'vitest';

import Store, { register } from '~/lib/v2/store';

const cleanupStore = () => {
  Store.instance._data = {};
};

describe('Store class', () => {
  afterEach(cleanupStore);

  it('has a singleton instance', () => {
    class OtherStore extends Store {}
    expect(OtherStore.instance).toBe(Store.instance);
  });

  describe('::all', () => {
    it('returns a matching collection', () => {
      const baseAllTestCollection = [];
      Store.instance._data['base-all-test-collection'] = baseAllTestCollection;
      expect(Store.all('base-all-test-collection')).toBe(baseAllTestCollection);
    });
  });
});

describe('@register decorator', () => {
  it('registers a model collection on store instance', () => {
    @register('test-instances')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestClass {
      static meta = { key: 'id' };
    }

    expect(Store.instance._data['test-instances']).toBeDefined();
  });

  it('does not register a collection with a duplicate store key', () => {
    const registerDuplicateModel = () => {
      @register('test-instances')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        static meta = { key: 'id' };
      }
    };

    expect(registerDuplicateModel).toThrowError();
  });

  cleanupStore();
});
