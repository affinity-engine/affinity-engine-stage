import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Evented,
  get,
  getOwner,
  getProperties,
  set,
  typeOf
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend(Evented, {
  _sceneRecordIndex: -1,

  esBus: multiton('message-bus', 'engineId', 'stageId'),

  init(...args) {
    this._super(...args);

    get(this, 'esBus').subscribe('shouldAbortScripts', this, this._abort);
  },

  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const direction = this._createDirection(directionName, this);

    return direction._setup(...args);
  },

  _createDirection(directionName, script) {
    const { engineId, stageId } = getProperties(this, 'engineId', 'stageId');
    const factory = getOwner(this).lookup(`affinity-engine/stage/direction:${directionName}`);

    return factory.create({ script, engineId, stageId });
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
    const esBus = get(this, 'esBus');
    const sceneRecordIndex = get(this, '_sceneRecordIndex');

    promise.then((direction) => {
      if (get(this, 'isAborted')) { return; }

      const isDirection = typeOf(direction) === 'instance' && get(direction, '_isDirection');
      const value = isDirection ? get(direction, 'result') || '_RESOLVED' : direction;

      esBus.publish('directionCompleted', sceneRecordIndex, value);
    });
  }
});
