import Ember from 'ember';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Evented,
  computed,
  get,
  getOwner,
  getProperties,
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

  _ensurePromise() {
    const promise = new Promise((resolve) => {
      set(this, 'resolve', resolve);
    });

    this.then = promise.then;
  },

  _ensureDirectable() {
    const {
      _directableDefinition,
      attrs,
      componentPath,
      id,
      layer,
      resolve,
      engineId,
      windowId
    } = getProperties(this, '_directableDefinition', 'attrs', 'componentPath', 'id', 'layer', 'resolve', 'engineId', 'windowId');

    const priorSceneRecord = get(this, 'script')._getPriorSceneRecord();

    this.publish(`ae:${engineId}:${windowId}:shouldHandleDirectable`, id, { attrs, componentPath, direction: this, layer, priorSceneRecord, resolve, engineId, windowId }, _directableDefinition);
  }
});
