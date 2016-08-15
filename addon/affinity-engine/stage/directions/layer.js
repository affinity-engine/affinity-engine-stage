import Ember from 'ember';
import { Direction } from 'affinity-engine-stage';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  get,
  getProperties,
  merge,
  set
} = Ember;

export default Direction.extend(BusPublisherMixin, {
  _setup(layer) {
    this._entryPoint();

    set(this, 'attrs.layer', layer);

    return this;
  },

  _reset() {
    const attrs = get(this, 'attrs');

    return this._super({ transitions: Ember.A(), ...getProperties(attrs, 'layer') });
  },

  transition(effect, duration, options = {}, type = 'transition') {
    this._entryPoint();

    const transitions = get(this, 'attrs.transitions');

    transitions.pushObject(merge({ duration, effect, type, queue: 'main' }, options));

    return this;
  },

  _perform(priorSceneRecord, resolve) {
    const {
      attrs,
      engineId,
      windowId
    } = getProperties(this, 'attrs', 'engineId', 'windowId');

    const layer = get(attrs, 'layer');

    set(this, '_restartingEngine', true);

    this.publish(`ae:${engineId}:${windowId}:${layer}:shouldDirectLayer`, { attrs, direction: this, priorSceneRecord, resolve });
  }
});
