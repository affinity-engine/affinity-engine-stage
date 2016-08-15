import Ember from 'ember';
import DirectionQueue from './direction-queue';
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

export default Ember.Object.extend(Evented, BusPublisherMixin, {
  _isDirection: true,
  _restartingEngine: true,

  attrs: computed(() => Ember.Object.create({ instance: 0 })),

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

  _entryPoint() {
    if (get(this, '_restartingEngine')) {
      this._reset();
    }

    this._convertToPromise();
    this._addToQueue();

    return this;
  },

  _reset(attrs) {
    set(this, '_restartingEngine', false);
    set(this, '_hasDefaultTransition', false);
    set(this, 'attrs', Ember.Object.create(attrs));
    set(this, 'queue', undefined);
  },

  _convertToPromise() {
    const that = this;

    that.then = function(...args) {
      return get(that, 'queue.allDirectionsAreLoaded').then(() => {
        return get(that, 'queue.executionComplete').then(...args);
      });
    };

    set(this, 'promise', { then: this.then });
  },

  // allows us to resolve the promise by returning the direction
  _devertFromPromise() {
    Reflect.deleteProperty(this, 'then');
  },

  _createDirection(name) {
    const meta = get(this, '_directionMeta');

    return getOwner(this).lookup(`affinity-engine/stage/direction:${name}`).create(meta);
  },

  _directionMeta: computed({
    get() {
      return getProperties(this, 'priorSceneRecord', 'queue', 'script', 'engineId', 'windowId');
    }
  }).readOnly().volatile(),

  _addToQueue() {
    const queue = get(this, 'queue') || set(this, 'queue', DirectionQueue.create({
      script: get(this, 'script'),
      priorSceneRecord: get(this, 'priorSceneRecord')
    }));

    if (!queue.contains(this)) {
      queue.unshiftObject(this);
      queue.startCountdown(this);
    }
  },

  _removeFromQueue() {
    get(this, 'queue').removeObject(this);
  },

  _perform(priorSceneRecord, resolve) {
    const {
      attrs,
      componentPath,
      id,
      layer,
      engineId,
      windowId
    } = getProperties(this, 'attrs', 'componentPath', 'id', 'layer', 'engineId', 'windowId');

    set(this, '_restartingEngine', true);

    this.publish(`ae:${engineId}:${windowId}:shouldHandleDirectable`, id, { attrs, componentPath, layer, direction: this, priorSceneRecord }, resolve);
  }
});
