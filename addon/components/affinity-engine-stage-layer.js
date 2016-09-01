import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { DirectableComponentMixin, layerName } from 'affinity-engine-stage';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties,
  set
} = Ember;

const { alias } = computed;

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  directables: computed(() => Ember.A()),
  name: '',

  transitions: alias('directable.transitions'),

  init(...args) {
    this._super(...args);

    const { engineId, name, windowId } = getProperties(this, 'engineId', 'name', 'windowId');

    this.on(`ae:${engineId}:${windowId}:${name}:shouldAddDirectable`, this, this._addDirectable);
  },

  _addDirectable(directable) {
    set(this, 'directable', directable);
  },

  animationAdapter: computed('directable.animationAdapter', {
    get() {
      return get(this, 'directable.animationAdapter') || '';
    }
  }),

  layerDirectables: computed('directables.@each.layer', 'name', {
    get() {
      return get(this, 'directables').filter((directable) => {
        return get(directable, 'layer') === get(this, 'name');
      });
    }
  }).readOnly(),

  layerName: computed('name', {
    get() {
      return layerName(get(this, 'name'));
    }
  }).readOnly(),

  childLayers: computed('directables.@each.layer', {
    get() {
      const name = get(this, 'name');
      const parentName = name ? `${name}.` : '';

      const childLayerDirectables = get(this, 'directables').filter((directable) => {
        return get(directable, 'layer').replace(name, '').length > 1;
      });

      const childLayerNames = Ember.A(childLayerDirectables.map((directable) => {
        return get(directable, 'layer');
      })).uniq();

      return childLayerNames.reduce((layers, layer) => {
        const subName = layer.replace(parentName, '').split('.')[0];
        const childLayerName = name ? `${name}.${subName}` : subName;
        const childLayer = childLayerDirectables.filter((directable) => {
          return get(directable, 'layer') === layer;
        });

        if (layers[childLayerName]) {
          layers[childLayerName] = layers[childLayerName].concat(childLayer);
        } else {
          layers[childLayerName] = childLayer;
        }

        return layers;
      }, {});
    }
  }).readOnly()
});
