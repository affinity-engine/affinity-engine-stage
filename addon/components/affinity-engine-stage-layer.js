import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { AnimatableMixin } from 'affinity-engine';
import { DirectableComponentMixin, layerName } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  assign,
  computed,
  get,
  getProperties,
  isPresent
} = Ember;

const { reads } = computed;

export default Component.extend(AnimatableMixin, DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',
  mediaElementSelector: '.ae-stage',

  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  config: multiton('affinity-engine/config', 'engineId'),

  directions: computed(() => Ember.A()),
  name: '',

  direction: reads('directionObserver.value'),
  directionConfiguration: reads('direction.configuration.attrs'),
  transitions: reads('configuration.transitions'),
  animator: reads('configuration.animator'),
  zIndex: reads('configuration.zIndex'),

  _baseConfiguration: computed('config', 'name', {
    get() {
      const name = get(this, 'name');

      return name ? get(this, `config.attrs.component.stage.layer.${name}.attrs`) || get(this, `config.attrs.default.component.stage.layer.${name}.attrs`) || {} : {};
    }
  }),

  configuration: computed('directionConfiguration', '_baseConfiguration', {
    get() {
      const baseConfiguration = get(this, '_baseConfiguration');
      const directionConfiguration =  get(this, 'directionConfiguration') || {};

      return assign({}, baseConfiguration, directionConfiguration);
    }
  }),

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
  }).readOnly(),

  didCompleteQueue() {
    this.resolve();
  }
});
