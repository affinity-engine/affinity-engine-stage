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

const { alias } = computed;

export default Component.extend(DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  directables: computed(() => Ember.A()),
  name: '',

  directable: alias('directableObserver.value'),
  transitions: alias('directable.transitions'),

  directableObserver: computed('layerDirectablesMap', 'name', {
    get() {
      const { layerDirectablesMap, name } = getProperties(this, 'layerDirectablesMap', 'name');
      const safeLayerName = name.replace('.', '/');

      return Ember.Object.extend({
        value: computed(`layerDirectablesMap.${safeLayerName}`, {
          get() {
            return isPresent(safeLayerName) ?
              get(this, `layerDirectablesMap.${safeLayerName}`) :
              {};
          }
        })
      }).create({ layerDirectablesMap });
    }
  }),

  animationLibrary: computed('directable.animationLibrary', {
    get() {
      return get(this, 'directable.animationLibrary') || '';
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
