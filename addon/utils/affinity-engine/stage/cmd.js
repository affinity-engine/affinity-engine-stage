import Ember from 'ember';

const {
  get,
  typeOf
} = Ember;

export default function cmd(optionsOrCb, onlyCb) {
  const cb = onlyCb || optionsOrCb;
  const options = typeOf(optionsOrCb) === 'object' ? optionsOrCb : {};

  return function(...args) {
    if (get(options, 'async')) {
      this._generatePromise();
    }

    cb.apply(this, args);

    return this;
  };
}
