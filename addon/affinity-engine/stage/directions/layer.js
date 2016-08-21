import Ember from 'ember';
import { configurable, deepArrayConfigurable } from 'affinity-engine';
import { Direction } from 'affinity-engine-stage';
import { BusPublisherMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  computed,
  get,
  getProperties,
  merge,
  set
} = Ember;

const configurationTiers = [
  '_attrs',
  'config.attrs.component.stage.direction.layer',
  'config.attrs.component.stage',
  'config.attrs'
];

export default Direction.extend(BusPublisherMixin, {
  attrs: computed(() => new Object({
    animationAdapter: configurable(configurationTiers, 'animationLibrary'),
    transitions: deepArrayConfigurable(configurationTiers, '_attrs.transitions', 'transition')
  })),

  config: multiton('affinity-engine/config', 'engineId'),

  _setup(layer) {
    this._entryPoint();

    set(this, 'attrs.layer', layer);

    return this;
  },

  _reset() {
    const _attrs = get(this, '_attrs');

    return this._super({ transitions: Ember.A(), ...getProperties(_attrs, 'layer') });
  },

  transition(effect, duration, options = {}, type = 'transition') {
    this._entryPoint();

    const transitions = get(this, '_attrs.transitions');

    transitions.pushObject(merge({ duration, effect, type, queue: 'main' }, options));

    return this;
  },

  _perform(priorSceneRecord, resolve) {
    const {
      _attrs,
      attrs,
      engineId,
      windowId
    } = getProperties(this, '_attrs', 'attrs', 'engineId', 'windowId');

    const layer = get(attrs, 'layer');

    set(this, '_restartingEngine', true);

    this.publish(`ae:${engineId}:${windowId}:${layer}:shouldDirectLayer`, { _attrs, direction: this, priorSceneRecord, resolve, engineId, windowId }, attrs);
  }
});
