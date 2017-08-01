import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  get,
  merge
} = Ember;

export default Direction.extend({
  config: multiton('affinity-engine/config', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'stageId'),

  render() {
    const layer = this.getConfiguration('layer');

    get(this, 'esBus').publish('shouldAddLayerDirection', layer, this);
  },

  _configurationTiers: [
    'instanceConfig',
    'config.attrs.component.stage.direction.layer',
    'config.attrs.component.stage',
    'config.attrs.global'
  ],

  _setup: cmd(function(layer, options) {
    this.configure(merge({
      layer,
      transitions: Ember.A()
    }, options));
  }),

  transition: cmd({ async: true, render: true }, function(effect, duration, options = {}) {
    const transitions = this.getConfiguration('transitions');

    transitions.pushObject(merge({ duration, effect }, options));
  })
});
