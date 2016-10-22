import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  computed,
  get,
  merge,
  set
} = Ember;

export default Direction.extend({
  config: multiton('affinity-engine/config', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'stageId'),

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
        animationLibrary: configurable(configurationTiers, 'animationLibrary'),
        layer: configurable(configurationTiers, 'layer'),
        transitions: configurable(configurationTiers, 'transitions')
      }
    }
  }),

  _setup: cmd(function(layer) {
    set(this, 'attrs.layer', layer);
  }),

  transition: cmd({ async: true, directable: true }, function(effect, duration, options = {}) {
    const transitions = get(this, 'attrs.transitions');

    transitions.pushObject(merge({ duration, effect }, options));
  }),

  _ensureDirectable() {
    const directable = get(this, 'directable') || set(this, 'directable', this._createDirectable());
    const layer = get(this, 'attrs.layer');

    get(this, 'esBus').publish('shouldAddLayerDirectable', layer, directable);
  }
});
