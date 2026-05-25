import { describe, expect, it } from 'vitest';

import Collection from '~/lib/v2/collection';

describe('Collection class', () => {
  describe('::create', () => {
    it('returns id-keyed collection instance by default', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const collection = Collection.create(data);
      expect(collection).toBeDefined();
      expect(collection.key).toBe('id');
      expect(collection[0].id).toBe(1);
      expect(collection[1].id).toBe(2);
      expect(collection[2].id).toBe(3);
    });

    it('returns unkeyed collection instance with null key option', () => {
      const collection = Collection.create(null, { key: null });
      expect(collection).toBeDefined();
      expect(collection.key).not.toBeDefined();
    });

    it('throws error when elements have duplicate keys', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 1 }];
      expect(() => Collection.create(data)).toThrowError();
    });
  });

  describe('#add', () => {
    it('adds new element to a collection', () => {
      const collection = Collection.create();
      const newModel = { id: 1 };
      collection.add(newModel);
      expect(collection).contains(newModel);
    });

    it('throws an error when new element is missing collection key', () => {
      const collection = Collection.create();
      const newModel = {};
      expect(() => collection.add(newModel)).toThrowError();
    });

    it('throws error when new element has a duplicate collection key', () => {
      const collection = Collection.create();
      const newModel = { id: 1 };
      const duplicateIdModel = { id: 1 };
      collection.add(newModel);
      expect(() => collection.add(duplicateIdModel)).toThrowError();
    });
  });

  describe('#delete', () => {
    it('deletes an element from a collection', () => {
      const collection = new Collection([1, 2, 3, 4, 5]);
      const deleted = collection.delete(4);
      expect(collection.includes(4)).toBe(false);
      expect(deleted).toBe(4);
    });
    it('throws error when arg is undefined', () => {
      const collection = new Collection([1, 2, 3, 4, 5]);
      expect(() => collection.delete(undefined)).toThrowError();
    });
    it('throws error when arg is not in collection', () => {
      const collection = new Collection([1, 2, 3, 4, 5]);
      expect(() => collection.delete(6)).toThrowError();
    });
  });

  describe('#get', () => {
    it('returns a model by id from a keyed collection', () => {
      const targetModel = { id: 1 };
      const collection = Collection.create([{ id: 2 }, targetModel, { id: 3 }]);
      expect(collection.get(1)).toBe(targetModel);
    });

    it('throws error on un-keyed collection', () => {
      const targetModel = { id: 1 };
      const collection = Collection.create([{ id: 2 }, targetModel, { id: 3 }], { key: null });
      expect(() => collection.get(1)).toThrowError();
    });
  });

  describe('#last', () => {
    it('returns last positioned element in collection', () => {
      const collection = Collection.create([1, 2, 3], { key: null });
      expect(collection.last).toBe(3);
    });
  });

  describe('#first', () => {
    it('returns last positioned element in collection', () => {
      const collection = Collection.create([1, 2, 3], { key: null });
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
      const collection = Collection.create([james, matt, maloof, ben, darragh]);

      expect(collection.where({ bar: 'ohanlons' })).toContain(james);
      expect(collection.where({ bar: 'ohanlons' })).toContain(matt);
      expect(collection.where({ bar: null })).toContain(maloof);
      expect(collection.where({ bar: 'flannerys' })).toContain(ben);
      expect(collection.where({ bar: 'flannerys' })).toContain(darragh);
    });
  });

  describe('#findBy', () => {
    it('returns one colletion element that satisfies predicate callback', () => {
      type MockPlayer = { name: string };
      const james = { id: 1, name: 'james', bar: 'ohanlons' };
      const matt = { id: 2, name: 'matt', bar: 'ohanlons' };
      const maloof = { id: 3, name: 'maloof', bar: null };
      const ben = { id: 4, name: 'ben', bar: 'flannerys' };
      const darragh = { id: 5, name: 'darragh', bar: 'flannerys' };
      const collection = Collection.create([james, matt, maloof, ben, darragh]);

      const longPredicate = (player: MockPlayer) => player.name.length === 5;
      const shortPredicate = (player: MockPlayer) => player.name.length === 6;
      const badPredicate = (player: MockPlayer) => player.name === 'tony roman';

      expect(collection.findBy(longPredicate)).toBe(james);
      expect(collection.findBy(shortPredicate)).toBe(maloof);
      expect(collection.findBy(badPredicate)).not.toBeDefined();
    });
  });
});
