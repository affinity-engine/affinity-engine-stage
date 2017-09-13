import Ember from 'ember';
import { deepMerge, nativeCopy } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Evented,
  assign,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  isPresent,
  set,
  setProperties
} = Ember;

const { RSVP: { Promise } } = Ember;
const { reads } = computed;

export default Ember.Object.extend(Evented, {
  _isDirection: true,

  engineConfig: multiton('affinity-engine/config', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  layer: reads('configuration.attrs.layer'),

  configuration: computed(() => Ember.Object.create({
    links: {},
    attrs: {
      layer: 'stage',
      zIndex: 0
    }
  })),
  linkedDirections: computed(() => Ember.Object.create()),
  _configurationTiers: computed(() => []),

  init(...args) {
    this._super(...args);

    Object.defineProperty(this, '_', {
      get() {
        return get(this, '_scriptProxy');
      }
    });
  },

  _applyEngineConfig() {
    this._applyConfigSource(get(this, 'engineConfig.attrs.default'));
    this._applyConfigSource(get(this, 'engineConfig.attrs'));
  },

  _applyLinkedConfig(links) {
    this._applyConfigSource(links);
    deepMerge(get(this, 'configuration.links'), links);
  },

  _applyConfigSource(source) {
    const configuration = get(this, 'configuration');
    const tiers = get(this, '_configurationTiers').slice(0).reverse();

    tiers.forEach((tier) => {
      deepMerge(configuration, nativeCopy(get(source, tier) || {}));
    });
  },

  applyFixture(fixture) {
    deepMerge(get(this, 'configuration'), nativeCopy(fixture || {}));
  },

  configure(key, value) {
    if (typeof key === 'object') {
      setProperties(get(this, 'configuration.attrs'), key);
    } else {
      set(get(this, 'configuration.attrs'), key, value);
    }

    return this;
  },

  link(types, key, value) {
    if (!Array.isArray(types)) types = [types];

    types.forEach((type) => {
      const links = get(this, 'configuration.links');

      if (typeof type === 'object') {
        deepMerge(links, type);
      } else {
        const linkType = type.split('.').reduce((target, path) => {
          return get(target, path) || set(target, path, { });
        }, links);
        const attrs = get(linkType, 'attrs') || set(linkType, 'attrs', {});

        if (typeof key === 'object') {
          setProperties(attrs, key);
        } else {
          set(attrs, key, value);
        }
      }
    });

    return this;
  },

  getConfiguration(...keys) {
    if (keys.length === 1) {
      return get(this, `configuration.attrs.${keys[0]}`);
    } else if (keys.length === 0) {
      return get(this, 'configuration.attrs');
    } else {
      return getProperties(get(this, 'configuration.attrs'), ...keys);
    }
  },

  resolve(...args) {
    const resolve = get(this, '_resolve');

    if (isPresent(resolve)) {
      Reflect.deleteProperty(this, '_resolve');

      const resolutions = isPresent(args) ? args : [this];

      resolve(...resolutions);
    }
  },

  render() {
    if (!get(this, 'isRendered')) {
      set(this, 'isRendered', true);
      get(this, 'esBus').publish('shouldAddDirection', this);
    }
  },

  ensurePromise() {
    if (isNone(get(this, '_resolve'))) {
      const promise = new Promise((resolve) => {
        set(this, '_resolve', resolve);
      });

      this.then = function(...args) {
        Reflect.deleteProperty(this, 'then');

        return promise.then(...args);
      };
    }
  },

  _scriptProxy: computed({
    get() {
      const { configuration, linkedDirections, script, engineId, stageId } = getProperties(this, 'configuration', 'linkedDirections', 'script', 'engineId', 'stageId');
      const linkToThisDirection = {};

      linkToThisDirection[get(this, 'directionName')] = this;

      return getOwner(this).factoryFor('affinity-engine/stage:script-proxy').create({
        configuration,
        script,
        engineId,
        stageId,
        linkedDirections: assign({}, linkedDirections, linkToThisDirection)
      });
    }
  }).readOnly(),

  _$instance: computed({
    get() {
      const component = get(this, 'component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile()
});
