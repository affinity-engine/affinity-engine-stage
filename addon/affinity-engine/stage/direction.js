import Ember from 'ember';
import { deepMerge, nativeCopy } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Evented,
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

  layer: reads('configuration.layer'),

  configuration: computed(() => Ember.Object.create({
    link: {},
    layer: 'stage',
    zIndex: 0
  })),
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
    this._applyConfigSource(get(this, 'engineConfig.attrs'));
  },

  _applyLinkedConfig(link) {
    this._applyConfigSource(link);
    set(this, 'configuration.link', link);
  },

  _applyConfigSource(source) {
    const configuration = get(this, 'configuration');
    const tiers = get(this, '_configurationTiers');

    tiers.forEach((tier) => {
      deepMerge(configuration, nativeCopy(get(source, tier) || {}));
    });
  },

  applyFixture(fixture) {
    this._applyConfigSource(fixture);
  },

  configure(key, value) {
    if (typeof key === 'object') {
      setProperties(get(this, 'configuration'), key);
    } else {
      set(get(this, 'configuration'), key, value);
    }

    return this;
  },

  link(types, key, value) {
    if (!Array.isArray(types)) types = [types];

    types.forEach((type) => {
      const link = get(this, 'configuration.link');

      if (typeof type === 'object') {
        setProperties(link, type);
      } else {
        const linkType = type.split('.').reduce((target, path) => {
          return get(target, path) || set(target, path, {});
        }, link);

        if (typeof key === 'object') {
          setProperties(linkType, key);
        } else {
          set(linkType, key, value);
        }
      }
    });

    return this;
  },

  getConfiguration(...keys) {
    if (keys.length === 1) {
      return get(this, `configuration.${keys[0]}`);
    } else if (keys.length === 0) {
      return get(this, 'configuration');
    } else {
      return getProperties(get(this, 'configuration'), ...keys);
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
      const { configuration, script, engineId, stageId } = getProperties(this, 'configuration', 'script', 'engineId', 'stageId');

      return getOwner(this).factoryFor('affinity-engine/stage:script-proxy').create({
        configuration,
        script,
        engineId,
        stageId
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
