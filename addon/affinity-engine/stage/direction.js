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
  on,
  set,
  setProperties
} = Ember;

const { RSVP: { Promise } } = Ember;

export default Ember.Object.extend(Evented, BusPublisherMixin, {
  _isDirection: true,
  _restartingEngine: true,

  attrs: computed(() => Ember.Object.create()),

  resolve() {
    const resolve = get(this, '_resolve');

    if (isPresent(resolve)) {
      Reflect.deleteProperty(this, 'then');

      resolve(this);
    }
  },

  _ensurePromise() {
    if (isNone(get(this, 'then'))) {
      const promise = new Promise((resolve) => {
        set(this, '_resolve', resolve);
      });

      this.then = function(...args) {
        return promise.then(...args);
      };
    }
  },

  prepareForChaining: on('directionReady', function(predecessors) {
    set(this, 'predecessors', predecessors);

    Object.defineProperty(this, '_', {
      get() {
        return get(this, '_scriptProxy');
      }
    });
  }),

  _scriptProxy: computed({
    get() {
      const script = get(this, 'script');
      const predecessors = Ember.A([this]).pushObjects(get(this, 'predecessors'));

      set(predecessors, 'arePredecessors', true);

      return getOwner(this).lookup('affinity-engine/stage:script-proxy').create(setProperties(this, {
        script,
        predecessors
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
