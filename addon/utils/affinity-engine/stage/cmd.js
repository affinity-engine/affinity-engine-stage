import Ember from 'ember';

const {
  get,
  run,
  typeOf
} = Ember;

export default function cmd(optionsOrCb, onlyCb) {
  const cb = onlyCb || optionsOrCb;
  const options = typeOf(optionsOrCb) === 'object' ? optionsOrCb : {};

  return function(...args) {
    run(() => {
      if (get(options, 'async')) {
        this._ensurePromise();
      }

      cb.apply(this, args);

      if (get(options, 'directable')) {
        this._ensureDirectable();
      }
    });

    return this;
  };
}
