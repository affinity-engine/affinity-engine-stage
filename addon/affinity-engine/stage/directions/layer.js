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

export default Direction.extend(BusPublisherMixin, {
  _configurationTiers: [
    'attrs',
    'config.attrs.component.stage.direction.layer',
    'config.attrs.component.stage',
    'config.attrs'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      const configurationTiers = get(this, '_configurationTiers');

      return {
        animationAdapter: configurable(configurationTiers, 'animationLibrary'),
        layer: configurable(configurationTiers, 'layer'),
        transitions: deepArrayConfigurable(configurationTiers, 'attrs.transitions', 'transition')
      }
    }
  }),

  config: multiton('affinity-engine/config', 'engineId'),

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
      _directableDefinition,
      attrs,
      engineId,
      windowId
    } = getProperties(this, '_directableDefinition', 'attrs', 'engineId', 'windowId');

    const layer = get(attrs, 'layer');

    set(this, '_restartingEngine', true);

    this.publish(`ae:${engineId}:${windowId}:${layer}:shouldDirectLayer`, { attrs, direction: this, priorSceneRecord, resolve, engineId, windowId }, _directableDefinition);
  }
});
