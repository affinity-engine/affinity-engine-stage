import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  assign,
  get
} = Ember;

export default Direction.extend({
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'stageId'),

  render() {
    const layer = this.getConfiguration('layer');

    get(this, 'esBus').publish('shouldAddLayerDirection', layer, this);
  },

  _configurationTiers: [
    'global',
    'component.stage',
    'layer',
    'component.stage.direction.layer'
  ],

  _setup: cmd(function(layer, options) {
    this.configure(assign({
      layer,
      transitions: Ember.A()
    }, options));
  }),

  transition: cmd({ async: true, render: true }, function(options = {}) {
    this.getConfiguration('transitions').pushObject(options);
  })
});
