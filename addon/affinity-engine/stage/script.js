import Ember from 'ember';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Evented,
  get,
  getOwner,
  getProperties,
  set,
  typeOf
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend(BusPublisherMixin, BusSubscriberMixin, Evented, {
  _sceneRecordIndex: -1,

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:shouldAbortScripts`, this, this._abort);
  },

  _executeDirection(directionName, args) {
    const factory = getOwner(this).lookup(`affinity-engine/stage/direction:${directionName}`);
    const predecessors = get(args[0], 'arePredecessors') ? args.shift() : Ember.A();

    if (get(this, 'isAborted')) { return resolve(); }

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const direction = factory.create({ script: this, engineId, windowId });

    direction.trigger('directionReady', predecessors);

    return direction._setup(...args);
  },

  _abort() {
    set(this, 'isAborted', true);
  },

  _incrementSceneRecordIndex() {
    this.incrementProperty('_sceneRecordIndex');
  },

  _getPriorSceneRecord() {
    const sceneRecordIndex = get(this, '_sceneRecordIndex');

    return get(this, `sceneRecord.${sceneRecordIndex}`);
  },

  _record(promise) {
    const engineId = get(this, 'engineId');
    const sceneRecordIndex = get(this, '_sceneRecordIndex');

    promise.then((direction) => {
      if (get(this, 'isAborted')) { return; }

      const isDirection = typeOf(direction) === 'instance' && get(direction, '_isDirection');
      const value = isDirection ? get(direction, 'result') || '_RESOLVED' : direction;

      this.publish(`ae:${engineId}:${get(this, 'windowId')}:directionCompleted`, sceneRecordIndex, value);
    });
  }
});
