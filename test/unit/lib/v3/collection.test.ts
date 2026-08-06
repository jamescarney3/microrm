import { describe, expect, it } from 'vitest';

import Collection from '~/lib/v3/collection';
import type Model from '~/lib/v3/model';

describe('Collection class', () => {
  describe('::create', () => {
    it('returns id-keyed collection instance by default', () => {
      const data = <Model[]>[];
      const collection = Collection.create(data);
      expect(collection).toBeDefined();
    });
  });

  describe('#get', () => {
    it('returns a model by id from a keyed collection', () => {
      const targetModel = { keyOrTemporaryKey: 3 } as unknown as Model;
      const otherModels = [
        { keyOrTemporaryKey: 1 },
        { keyOrTemporaryKey: 2 },
        { keyOrTemporaryKey: 4 },
      ] as unknown as Model[];
      const collection = Collection.create([...otherModels, targetModel]);
      expect(collection.get(3)).toBe(targetModel);
    });
  });

  describe('#last', () => {
    it('returns last positioned element in collection', () => {
      const collection = Collection.create([1, 2, 3] as unknown as Model[]);
      expect(collection.last).toBe(3);
    });
  });

  describe('#first', () => {
    it('returns last positioned element in collection', () => {
      const collection = Collection.create([1, 2, 3] as unknown as Model[]);
      expect(collection.first).toBe(1);
    });
  });

  describe('#where', () => {
    it('returns collection elements filtered by attributes', () => {
      const james = { id: 1, name: 'james', bar: 'ohanlons' };
      const matt = { id: 2, name: 'matt', bar: 'ohanlons' };
      const maloof = { id: 3, name: 'maloof', bar: null };
      const ben = { id: 4, name: 'ben', bar: 'flannerys' };
      const darragh = { id: 5, name: 'darragh', bar: 'flannerys' };
      const collection = Collection.create([james, matt, maloof, ben, darragh] as unknown as Model[]);

      expect(collection.where({ bar: 'ohanlons' })).toContain(james);
      expect(collection.where({ bar: 'ohanlons' })).toContain(matt);
      expect(collection.where({ bar: null })).toContain(maloof);
      expect(collection.where({ bar: 'flannerys' })).toContain(ben);
      expect(collection.where({ bar: 'flannerys' })).toContain(darragh);
    });
  });

  describe('#findBy', () => {
    it('returns one colletion element that satisfies predicate callback', () => {
      const james = { id: 1, name: 'james', bar: 'ohanlons' } as unknown as Model;
      const matt = { id: 2, name: 'matt', bar: 'ohanlons' } as unknown as Model;
      const maloof = { id: 3, name: 'maloof', bar: null } as unknown as Model;
      const ben = { id: 4, name: 'ben', bar: 'flannerys' } as unknown as Model;
      const darragh = { id: 5, name: 'darragh', bar: 'flannerys' } as unknown as Model;
      const collection = Collection.create([james, matt, maloof, ben, darragh] as unknown as Model[]);

      const longPredicate = (player: Model) => (<string>player.name).length === 5;
      const shortPredicate = (player: Model) => (<string>player.name).length === 6;
      const badPredicate = (player: Model) => player.name === 'tony roman';

      expect(collection.findBy(longPredicate)).toBe(james);
      expect(collection.findBy(shortPredicate)).toBe(maloof);
      expect(collection.findBy(badPredicate)).not.toBeDefined();
    });
  });

  describe('#delete', () => {
    it('deletes an item from a collection', () => {
      const targetModel = { keyOrTemporaryKey: 3 } as unknown as Model;
      const otherModels = [
        { keyOrTemporaryKey: 1 },
        { keyOrTemporaryKey: 2 },
        { keyOrTemporaryKey: 4 },
      ] as unknown as Model[];
      const collection = Collection.create([...otherModels, targetModel]);
      const deleted = collection.delete(targetModel);
      expect(collection).not.toContain(targetModel);
      expect(deleted).toBe(deleted);
    });

    it('does not error when item is not presentin collection', () => {
      const targetModel = { keyOrTemporaryKey: 3 } as unknown as Model;
      const otherModels = [
        { keyOrTemporaryKey: 1 },
        { keyOrTemporaryKey: 2 },
        { keyOrTemporaryKey: 4 },
      ] as unknown as Model[];
      const collection = Collection.create([...otherModels]);
      const deleted = collection.delete(targetModel);
      expect(deleted).toBe(deleted);
    });
  });
});
