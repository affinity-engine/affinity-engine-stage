import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Evented,
  get,
  getOwner,
  getProperties,
  set
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend(Evented, {
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  init(...args) {
    this._super(...args);

    get(this, 'esBus').subscribe('shouldAbortScripts', this, this._abort);
  },

  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const direction = this._createDirection(directionName, this);

    direction._applyEngineConfig();

    return direction._setup(...args);
  },

  _createDirection(directionName, script) {
    const { engineId, stageId } = getProperties(this, 'engineId', 'stageId');
    const factory = getOwner(this).factoryFor(`affinity-engine/stage/direction:${directionName}`);

    return factory.create({ script, engineId, stageId });
  },

  _abort() {
    set(this, 'isAborted', true);
  }
});
