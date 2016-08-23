import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { DirectableComponentMixin, layerName } from 'affinity-engine-stage';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getOwner,
  getProperties,
  set,
  setProperties
} = Ember;

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],


  directables: computed(() => Ember.A()),
  name: '',

  init(...args) {
    this._super(...args);

    const { engineId, name, windowId } = getProperties(this, 'engineId', 'name', 'windowId');

    this.on(`ae:${engineId}:${windowId}:${name}:shouldDirectLayer`, this, this._shouldDirect);
  },

  _shouldDirect(properties, directableDefinition) {
    const directable = get(this, 'directable') || set(this, 'directable', this._createDirectable(directableDefinition));

    setProperties(directable, properties);
  },

  _createDirectable(directableDefinition) {
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');

    return Directable.extend(directableDefinition).create();
  },

  animationAdapter: computed('directable.animationAdapter', {
    get() {
      return get(this, 'directable.animationAdapter') || '';
    }
  }),

  transitions: computed('directable.transitions', {
    get() {
      return get(this, 'directable.transitions') || Ember.A();
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
