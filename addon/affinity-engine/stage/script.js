import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Evented,
  get,
  getOwner,
  getProperties,
  on,
  set,
  typeOf
} = Ember;

export default Ember.Object.extend(BusPublisherMixin, BusSubscriberMixin, Evented, {
  _sceneRecordIndex: -1,

  stage: multiton('affinity-engine/stage/stage', 'theaterId', 'windowId'),

  _setupEvents: on('init', function() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.on(`et:${theaterId}:${windowId}:scriptsMustAbort`, this, this._abort);
  }),

  _executeDirection(directionName, args) {
    const factory = getOwner(this).lookup(`affinity-engine/stage/direction:${directionName}`);
    const predecessors = get(args[0], 'arePredecessors') ? args.shift() : Ember.A();

    return get(this, 'stage').direct(this, factory, predecessors, args);
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
    const theaterId = get(this, 'theaterId');
    const sceneRecordIndex = get(this, '_sceneRecordIndex');

    promise.then((direction) => {
      if (get(this, 'isAborted')) { return; }

      const isDirection = typeOf(direction) === 'instance' && get(direction, '_isDirection');
      const value = isDirection ? get(direction, 'result') || '_RESOLVED' : direction;

      this.publish(`et:${theaterId}:${get(this, 'windowId')}:directionCompleted`, sceneRecordIndex, value);
    });
  }
});
