import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  assign,
  get,
  set
} = Ember;

export default Direction.extend({
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'stageId'),

  render() {
    const layer = this.getConfiguration('layer');

    get(this, 'esBus').publish('shouldAddLayerDirection', layer, this);
  },

  _configurationTiers: [
    'component.stage.direction.layer',
    'layer',
    'component.stage.direction.all',
    'component.stage.all',
    'all'
  ],

  _setup: cmd(function(layer, options) {
    const activeLayers = get(this, 'script._activeLayers') || set(this, 'script._activeLayers', {});
    const activeLayer = get(activeLayers, `${layer}._instance`);
    if (activeLayer) {
      if (options) activeLayer.configure(options);

      return activeLayer;
    }

    this.configure(assign({
      layer,
      transitions: Ember.A()
    }, options));

    layer.split('.').reduce((previousLayer, pathName) => {
      return get(previousLayer, pathName) || set(previousLayer, pathName, {});
    }, activeLayers)._instance = this;
  }),

  transition: cmd({ async: true, render: true }, function(options = {}) {
    this.getConfiguration('transitions').pushObject(options);
  })
});
