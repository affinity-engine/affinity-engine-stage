import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { configurable, deepArrayConfigurable } from 'affinity-engine';
import { DirectableComponentMixin, layerName } from 'affinity-engine-stage';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties,
  setProperties
} = Ember;

const configurationTiers = [
  'directable.attrs',
  'config.attrs.component.stage.direction.layer',
  'config.attrs.component.stage',
  'config.attrs'
];

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  directables: computed(() => Ember.A()),
  name: '',

  animationAdapter: configurable(configurationTiers, 'animationLibrary'),
  transitions: deepArrayConfigurable(configurationTiers, 'directable.attrs.transitions', 'transition'),

  init(...args) {
    this._super(...args);

    const { engineId, name, windowId } = getProperties(this, 'engineId', 'name', 'windowId');

    this.on(`ae:${engineId}:${windowId}:${name}:shouldDirectLayer`, this, this._shouldDirect);
  },

  _shouldDirect(directable) {
    setProperties(this, { directable });
  },

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
