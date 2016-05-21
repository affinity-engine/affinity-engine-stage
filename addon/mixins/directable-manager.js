import Ember from 'ember';

const {
  Mixin,
  get,
  getOwner,
  isBlank,
  merge,
  set,
  setProperties
} = Ember;

export default Mixin.create({
  handleDirectable(id, properties, resolve) {
    const directable = get(properties, 'direction.directable');

    if (isBlank(directable)) {
      this._addNewDirectable(merge(properties, { id, resolve }));
    } else {
      this._updateDirectable(directable, properties, resolve);
    }
  },

  _addNewDirectable(properties) {
    const Directable = getOwner(this).lookup('ember-theater/director:directable');
    const directable = Directable.create(properties);

    set(get(properties, 'direction'), 'directable', directable);
  },

  _updateDirectable(directable, properties, resolve) {
    const attrs = Ember.$.extend({}, get(directable, 'attrs'), get(properties, 'attrs'));

    setProperties(directable, merge(properties, { resolve, attrs }));
  }
});
