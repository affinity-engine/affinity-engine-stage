import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { DirectableComponentMixin, layerName } from 'affinity-engine-stage';

const {
  Component,
  computed,
  get,
  getProperties,
  isPresent
} = Ember;

const { reads } = computed;

export default Component.extend(DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  directions: computed(() => Ember.A()),
  name: '',

  configuration: reads('direction.configuration'),
  direction: reads('directionObserver.value'),
  transitions: reads('configuration.transitions'),

  directionObserver: computed('layerDirectionsMap', 'name', {
    get() {
      const { layerDirectionsMap, name } = getProperties(this, 'layerDirectionsMap', 'name');
      const safeLayerName = name.replace(/\./g, '/');

      return Ember.Object.extend({
        value: computed(`layerDirectionsMap.${safeLayerName}`, {
          get() {
            return isPresent(safeLayerName) ?
              get(this, `layerDirectionsMap.${safeLayerName}`) :
              {};
          }
        })
      }).create({ layerDirectionsMap });
    }
  }),

  animator: computed('direction.animator', {
    get() {
      return get(this, 'direction.animator') || '';
    }
  }),

  layerDirections: computed('directions.@each.layer', 'name', {
    get() {
      return get(this, 'directions').filter((direction) => {
        return get(direction, 'layer') === get(this, 'name');
      });
    }
  }).readOnly(),

  layerName: computed('name', {
    get() {
      return layerName(get(this, 'name'));
    }
  }).readOnly(),

  childLayers: computed('directions.@each.layer', {
    get() {
      const name = get(this, 'name');
      const parentName = name ? `${name}.` : '';

      const childLayerDirections = get(this, 'directions').filter((direction) => {
        return get(direction, 'layer').replace(name, '').length > 1;
      });

      const childLayerNames = Ember.A(childLayerDirections.map((direction) => {
        return get(direction, 'layer');
      })).uniq();

      return childLayerNames.reduce((layers, layer) => {
        const subName = layer.replace(parentName, '').split('.')[0];
        const childLayerName = name ? `${name}.${subName}` : subName;
        const childLayer = childLayerDirections.filter((direction) => {
          return get(direction, 'layer') === layer;
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
