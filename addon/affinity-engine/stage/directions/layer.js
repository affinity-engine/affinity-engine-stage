import Ember from 'ember';
import { configurable, deepArrayConfigurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
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
  config: multiton('affinity-engine/config', 'engineId'),

  attrs: computed(() => Ember.Object.create({
    transitions: Ember.A()
  })),

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

  _setup: cmd(function(layer) {
    this._entryPoint();

    set(this, 'attrs.layer', layer);
  }),

  _reset() {
    this._super();

    get(this, 'attrs.transitions').clear();
  },

  transition: cmd(function(effect, duration, options = {}) {
    this._entryPoint();

    const transitions = get(this, 'attrs.transitions');

    transitions.pushObject(merge({ duration, effect }, options));
  }),

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
