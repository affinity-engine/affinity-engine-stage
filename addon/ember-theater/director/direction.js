import Ember from 'ember';
import multiton from 'ember-multiton-service';
import DirectionQueue from './direction-queue';

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

export default Ember.Object.extend(Evented, {
  _isDirection: true,
  _shouldReset: true,

  attrs: computed(() => Ember.Object.create({ instance: 0 })),

  sceneManager: multiton('ember-theater/director/scene-manager', 'theaterId', 'windowId'),
  stageManager: multiton('ember-theater/director/stage-manager', 'theaterId', 'windowId'),

  prepareForChaining: on('directionReady', function(predecessors) {
    set(this, 'predecessors', predecessors);

    Object.defineProperty(this, '_', {
      get() {
        const script = get(this, 'script');
        const childPredecessors = Ember.A([this]).pushObjects(predecessors.toArray());

        set(childPredecessors, 'arePredecessors', true);

        return getOwner(this).lookup('ember-theater/director:script-proxy').create(setProperties(this, {
          script,
          predecessors: childPredecessors
        }));
      }
    });
  }),

  _$instance: computed({
    get() {
      const component = get(this, 'directable.component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile(),

  _entryPoint() {
    if (get(this, '_shouldReset')) {
      this._reset();
    }

    this._convertToPromise();
    this._addToQueue();

    return this;
  },

  _reset(attrs) {
    set(this, '_shouldReset', false);
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

    return getOwner(this).lookup(`ember-theater/director/direction:${name}`).create(meta);
  },

  _directionMeta: computed({
    get() {
      return getProperties(this, 'priorSceneRecord', 'queue', 'script', 'theaterId', 'windowId');
    }
  }).readOnly().volatile(),

  _addToQueue() {
    const queue = get(this, 'queue') || set(this, 'queue', DirectionQueue.create({
      script: get(this, 'script'),
      sceneManager: get(this, 'sceneManager'),
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
      stageManager
    } = getProperties(this, 'attrs', 'componentPath', 'id', 'layer', 'stageManager');

    set(this, '_shouldReset', true);

    stageManager.handleDirectable(id, { attrs, componentPath, layer, direction: this, priorSceneRecord }, resolve);
  }
});
