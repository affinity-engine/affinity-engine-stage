import Ember from 'ember';
import { BusPublisherMixin } from 'ember-message-bus';

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

export default Ember.Object.extend(Evented, BusPublisherMixin, {
  _isDirection: true,
  _restartingEngine: true,

  attrs: computed(() => Ember.Object.create()),
  links: computed(() => Ember.Object.create()),

  init(...args) {
    this._super(...args);

    Object.defineProperty(this, '_', {
      get() {
        return get(this, '_scriptProxy');
      }
    });
  },

  resolve(...args) {
    const resolve = get(this, '_resolve');

    if (isPresent(resolve)) {
      Reflect.deleteProperty(this, '_resolve');

      const resolutions = isPresent(args) ? args : [this];

      resolve(...resolutions);
    }
  },

  _ensurePromise() {
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
      const { directionName, links } = getProperties(this, 'directionName', 'links');

      set(links, directionName, this);

      return getOwner(this).lookup('affinity-engine/stage:script-proxy').create(setProperties(this, {
        links,
        ...getProperties(this, 'script', 'engineId', 'windowId')
      }));
    }
  }).readOnly(),

  _$instance: computed({
    get() {
      const component = get(this, 'directable.component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile(),

  _ensureDirectable() {
    if (isNone(get(this, 'directable'))) {
      const directable = this._createDirectable();
      const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

      set(this, 'directable', directable);

      this.publish(`ae:${engineId}:${windowId}:shouldAddDirectable`, directable);
    }
  },

  _createDirectable() {
    const directableDefinition = get(this, '_directableDefinition');
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');

    return Directable.extend(directableDefinition).create({
      ...getProperties(this, 'attrs', 'componentPath', 'layer', 'engineId', 'windowId'),
      priorSceneRecord: get(this, 'script')._getPriorSceneRecord(),
      direction: this
    });
  }
});
