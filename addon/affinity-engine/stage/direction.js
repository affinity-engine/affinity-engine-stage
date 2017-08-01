import Ember from 'ember';
import { deepMerge } from 'affinity-engine';
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

export default Ember.Object.extend(Evented, {
  _isDirection: true,

  config: multiton('affinity-engine/config', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  instanceConfig: computed(() => Ember.Object.create()),
  links: computed(() => Ember.Object.create({
    configurations: Ember.A(),
    fixtures: Ember.Object.create()
  })),
  _configurationTiers: computed(() => []),
  _linkedFixtures: computed(() => Ember.Object.create()),

  configuration: computed({
    get() {
      let configuration = get(this, '_configuration');

      if (!configuration) {
        configuration = set(this, '_configuration', new Proxy(this, {
          get: (target, key) => {
            if (typeof key !== 'string') return;

            const tiers = get(target, '_configurationTiers');
            const tier = tiers.find((tier) => {
              if (tier.indexOf('.@each') > -1) {
                const parts = tier.split('.@each');
                const firstPart = get(target, parts[0]);
                if (firstPart && firstPart.find) {
                  return firstPart.find((part) => {
                    if (part !== configuration) return get(part, parts[1].length > 0 ? `${parts[1]}.${key}` : key);
                  }) !== undefined;
                } else {
                  return false;
                }
              } else {
                return get(target, `${tier}.${key}`);
              }
            });

            if (isPresent(tier)) {
              if (tier.indexOf('.@each') > -1) {
                const parts = tier.split('.@each');
                const part = get(target, parts[0]).find((part) => get(part, parts[1].length > 0 ? `${parts[1]}.${key}` : key));

                return get(part, parts[1].length > 0 ? `${parts[1]}.${key}` : key);
              } else {
                return get(target, `${tier}.${key}`);
              }
            }
          }
        }))
      }

      return configuration;
    }
  }),

  init(...args) {
    this._super(...args);

    Object.defineProperty(this, '_', {
      get() {
        return get(this, '_scriptProxy');
      }
    });
  },

  configure(key, value) {
    if (typeof key === 'object') {
      setProperties(get(this, 'instanceConfig'), key);
    } else {
      set(get(this, 'instanceConfig'), key, value);
    }

    // TODO: potentially expensive; if 'configuration' were an Ember Object it
    // would notify the property change on its own. however, I don't know a way
    // to return default values for Ember Object properties that are 'undefined'
    this.notifyPropertyChange('configuration');

    return this;
  },

  getConfiguration(...keys) {
    if (keys.length === 1) {
      return get(this, `instanceConfig.${keys[0]}`);
    } else if (keys.length === 0) {
      return get(this, 'instanceConfig');
    } else {
      return getProperties(get(this, 'instanceConfig'), ...keys);
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
      const { directionName, links, linkedConfigurations, script, engineId, stageId } = getProperties(this, 'directionName', 'links', 'linkedConfigurations', 'script', 'engineId', 'stageId');

      set(links, directionName, this);

      return getOwner(this).factoryFor('affinity-engine/stage:script-proxy').create({
        links,
        linkedConfigurations,
        linkedFixtures: get(this, '_linkedFixtures'),
        script,
        engineId,
        stageId
      });
    }
  }).readOnly(),

  linkedConfigurations: computed({
    get() {
      const configurations = get(this, 'links.configurations').copy();
      configurations.push(get(this, 'configuration'));

      return configurations;
    }
  }),

  _linkFixture(fixture) {
    deepMerge(get(this, '_linkedFixtures'), fixture);
  },

  _$instance: computed({
    get() {
      const component = get(this, 'component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile()
});
