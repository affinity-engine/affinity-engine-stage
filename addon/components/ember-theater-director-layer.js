import Ember from 'ember';
import layout from '../templates/components/ember-theater-director-layer';
import { deepArrayConfigurable } from 'ember-theater';
import { DirectableComponentMixin, TransitionableComponentMixin, TransitionableComponentAutoMixin, layerName } from 'ember-theater-director';
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
  'config.attrs.director.layer',
  'config.attrs.director',
  'config.attrs.globals'
];

export default Component.extend(BusPublisherMixin, DirectableComponentMixin, TransitionableComponentMixin, TransitionableComponentAutoMixin, {
  layout,

  hook: 'ember_theater_director_layer',

  attributeBindings: ['animationName:animation-name'],
  classNames: ['et-layer'],
  classNameBindings: ['layerName'],

  directables: computed(() => Ember.A()),
  name: '',

  animation: alias('layerFilter.animation'),
  animationName: alias('layerFilter.animationName'),
  transitions: deepArrayConfigurable(configurationTiers, 'directable.attrs.transitions', 'transition'),

  init() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.publish(`et:${theaterId}:${windowId}:layerAdded`, this);

    this._super();
  },

  didInsertElement() {
    this._setupAnimationEnd();

    this._super();
  },

  willDestroyElement() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.publish(`et:${theaterId}:${windowId}:layerRemoved`, this);

    this._super();
  },

  addFilter(transition) {
    return new Promise((resolve) => {
      run(() => {
        const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

        this.publish(`et:${theaterId}:${windowId}:filterQueued`, resolve, get(transition, 'effect'), transition, get(this, 'layerName'));
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
