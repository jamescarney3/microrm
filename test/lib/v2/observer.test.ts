// @ts-nocheck
import { afterEach, describe, expect, it, vi } from 'vitest';

import Observer from '~/lib/v2/observer';

const cleanupObserver = () => {
  Observer.instance._observers = new Set();
};

describe('Observer class', () => {
  afterEach(() => {
    cleanupObserver();
  });

  it('has a singleton instance', () => {
    class OtherObserver extends Observer {}
    expect(OtherObserver.instance).toBe(Observer.instance);
  });

  describe('::subscribe', () => {
    it('subscribes a callback', () => {
      const callback = vi.fn();
      Observer.subscribe(callback);
      Observer.notify('foo');
      expect(callback).toHaveBeenCalledWith('foo');
    });
  });

  describe('::unsubscribe', () => {
    it('unsubscribes a callback', () => {
      const callback = vi.fn();
      Observer.subscribe(callback);
      Observer.unsubscribe(callback);
      Observer.notify('foo');
      expect(callback).not.toHaveBeenCalledWith('foo');
    });
  });

  describe('::notify', () => {
    it('notifies observer callbacks', () => {
      const fooCallback = vi.fn();
      const barCallback = vi.fn();
      vi.spyOn(Observer, 'instance', 'get').mockReturnValue({ _observers: [fooCallback, barCallback] });
      Observer.notify('baz');
      expect(fooCallback).toHaveBeenCalledWith('baz');
      expect(barCallback).toHaveBeenCalledWith('baz');
    });
  });
});
