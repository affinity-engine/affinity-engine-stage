import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-layer';
import { deepArrayConfigurable } from 'affinity-engine';
import { DirectableComponentMixin, TransitionableComponentMixin, TransitionableComponentAutoMixin, layerName } from 'affinity-engine-stage';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties,
  isPresent,
  observer,
  run,
  set
} = Ember;

const { RSVP: { Promise } } = Ember;

const { alias } = computed;

const configurationTiers = [
  'directable.attrs',
  'config.attrs.stage.layer',
  'config.attrs.stage',
  'config.attrs.globals'
];

export default Component.extend(BusPublisherMixin, DirectableComponentMixin, TransitionableComponentMixin, TransitionableComponentAutoMixin, {
  layout,

  hook: 'affinity_engine_stage_layer',

  attributeBindings: ['animationName:animation-name'],
  classNames: ['ae-stage-layer'],
  classNameBindings: ['layerName'],

  directables: computed(() => Ember.A()),
  name: '',

  animation: alias('layerFilter.animation'),
  animationName: alias('layerFilter.animationName'),
  transitions: deepArrayConfigurable(configurationTiers, 'directable.attrs.transitions', 'transition'),

  init() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.publish(`et:${engineId}:${windowId}:layerAdded`, this);

    this._super();
  },

  didInsertElement() {
    this._setupAnimationEnd();

    this._super();
  },

  willDestroyElement() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.publish(`et:${engineId}:${windowId}:layerRemoved`, this);

    this._super();
  },

  addFilter(transition) {
    return new Promise((resolve) => {
      run(() => {
        const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

        this.publish(`et:${engineId}:${windowId}:filterQueued`, resolve, get(transition, 'effect'), transition, get(this, 'layerName'));
      });
    });
  },

  _setupAnimationEnd() {
    this.$().on('animationend', () => {
      run(() => {
        const {
          layerFilter: {
            effect,
            resolve
          }
        } = getProperties(this, 'layerFilter');

        // there's a brief moment after an animation ends before which Ember changes the css through
        // `set(this, 'filter', effect)`. To get around this, we manually set the `filter` with jquery,
        // knowing that Ember will overwrite our changes with `attributeBindings: ['style']`.
        this.$().css({ filter: effect, '-webkit-filter': effect });
        set(this, 'filter', effect);

        if (isPresent(resolve)) { resolve(); }
      });
    });
  },

  _resetFilter: observer('layerFilter.effect', function() {
    // we need to manually reset the filter whenever the effect changes, or else the new effect will
    // not display
    set(this, 'filter', null);
  }),

  styles: computed('animation', 'keyframeName', 'filter', {
    get() {
      const {
        animation,
        animationName,
        filter
      } = getProperties(this, 'animation', 'animationName', 'filter');

      return [`
        animation: ${animation};
        animation-name: ${animationName};
        filter: ${filter};
        -webkit-filter: ${filter};
      `.replace(/\n|\s{2}/g, '')];
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
