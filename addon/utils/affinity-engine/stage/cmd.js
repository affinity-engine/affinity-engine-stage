// import Ember from 'ember';
//
// const {
//   typeOf
// } = Ember;

export default function cmd(optionsOrCb, onlyCb) {
  const cb = onlyCb || optionsOrCb;
  // const options = typeOf(optionsOrCb) === 'object' ? optionsOrCb : {};

  return function(...args) {
    cb.apply(this, args);

    return this;
  };
}
