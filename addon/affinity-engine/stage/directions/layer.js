import Ember from 'ember';
import { configurable } from 'affinity-engine';
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
    const {
      _directableDefinition,
      attrs,
      engineId,
      windowId
    } = getProperties(this, '_directableDefinition', 'attrs', 'engineId', 'windowId');

    const layer = get(attrs, 'layer');
    const priorSceneRecord = get(this, 'script')._getPriorSceneRecord();

    this.publish(`ae:${engineId}:${windowId}:${layer}:shouldDirectLayer`, { attrs, direction: this, priorSceneRecord, engineId, windowId }, _directableDefinition);
  }
});
