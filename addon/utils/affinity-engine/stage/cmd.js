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
      this.ensurePromise();
    }

    const returnValue = cb.apply(this, args);

    if (get(options, 'render')) {
      this.render()
    }

    return returnValue || this;
  };
}
