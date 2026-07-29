type ObserverCallback<T> = (args: T) => unknown | void;

class Observer {
  private constructor() {}

  static #instance: Observer;

  static get instance(): Observer {
    if (!Observer.#instance) Observer.#instance = new Observer();
    return Observer.#instance;
  }

  _observers = new Set<ObserverCallback<unknown>>();

  static subscribe(callback: ObserverCallback<unknown>): void {
    this.instance._observers.add(callback);
  }

  static unsubscribe(callback: ObserverCallback<unknown>): void {
    this.instance._observers.delete(callback);
  }

  static notify(data: unknown): void {
    [...this.instance._observers].forEach((cb) => cb(data));
  }
}

export default Observer;
