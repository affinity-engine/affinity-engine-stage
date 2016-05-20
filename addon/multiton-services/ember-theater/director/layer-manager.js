import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import { MultitonIdsMixin } from 'ember-theater';
import { BusSubscriberMixin } from 'ember-message-bus';
import { DirectableManagerMixin, layerName } from 'ember-theater-director';

const {
  Evented,
  computed,
  generateGuid,
  get,
  getProperties,
  on,
  set,
  setProperties,
  typeOf
} = Ember;

const { run: { later } } = Ember;
const { inject: { service } } = Ember;

export default MultitonService.extend(BusSubscriberMixin, DirectableManagerMixin, Evented, MultitonIdsMixin, {
  dynamicStylesheet: service(),

  filters: computed(() => Ember.A()),
  layers: computed(() => Ember.A()),

  setupEvents: on('init', function() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.on(`et:${theaterId}:${windowId}:filterQueued`, this, this.addFilter);
    this.on(`et:${theaterId}:${windowId}:layerAdded`, this, this.registerLayer);
    this.on(`et:${theaterId}:${windowId}:layerRemoved`, this, this.unregisterLayer);
    this.on(`et:${theaterId}:${windowId}:stageIsClearing`, this, this.clearFilters);
  }),

  registerLayer(layer) {
    get(this, 'layers').pushObject(layer);

    this._applyFilter(layer);
  },

  unregisterLayer(layer) {
    get(this, 'layers').removeObject(layer);
  },

  getLayer(name) {
    return get(this, 'layers').find((layer) => get(layer, 'layerName') === layerName(name));
  },

  _addNewDirectable(properties) {
    this._super(properties);

    const directable = get(properties, 'direction.directable');
    const layer = this.getLayer(get(properties, 'id'));

    set(layer, 'directable', directable);
  },

  getFilter(layer) {
    return this.get('filters').find((filter) => {
      return filter.get('layer') === layer;
    });
  },

  addFilter(resolve, effect, { duration = 0, timing = 'linear', iterations = 1, destroy }, layer) {
    const filters = get(this, 'filters');
    const filter = this.getFilter(layer) || Ember.Object.create({ layer });
    const previousKeyframes = get(filter, 'keyframes');
    const animationName = generateGuid(filter, 'filter');
    const animation = `keyframeName ${duration}ms ${timing} ${iterations}`;
    const effects = typeOf(effect) === 'array' ? effect : [effect];
    const totalEffects = effects.length - 1;
    const keyframeStates = effects.reduce((states, state, index) => {
      const percentage = 100;
      const percent = index / totalEffects * percentage;

      return `${states}${percent}%{-webkit-filter:${state};filter:${state};}`;
    }, '');
    const keyframes = `@keyframes ${animationName} { ${keyframeStates} }`;
    const dynamicStylesheet = get(this, 'dynamicStylesheet');

    dynamicStylesheet.deleteRule(previousKeyframes);
    dynamicStylesheet.insertRule(keyframes);

    setProperties(filter, {
      animation,
      animationName,
      duration,
      keyframes,
      resolve,
      effect: effects[totalEffects]
    });

    if (!filters.any((item) => get(item, 'layer') === layer)) {
      filters.pushObject(filter);
    }

    if (destroy) {
      later(() => {
        this.destroyFilter(layer, filter);
      }, duration);
    }

    this._applyFilter(layer, filter);
  },

  destroyFilter(layer, filter) {
    const { dynamicStylesheet, filters } = getProperties(this, 'dynamicStylesheet', 'filters');
    const keyframes = get(filter, 'keyframes');

    dynamicStylesheet.deleteRule(keyframes);
    filters.removeObject(filter);
    filter.destroy();

    this._applyFilter(layer, filter);
  },

  clearFilters() {
    get(this, 'filters').forEach((filter) => {
      this.destroyFilter(filter);
    });
  },

  _applyFilter(layer, pregenFilter) {
    const name = get(layer, 'layerName');
    const filter = pregenFilter || get(this, 'filters').find((filter) => {
      return get(filter, 'layer') === name;
    }) || {};

    set(layer, 'layerFilter', filter);
  }
});
