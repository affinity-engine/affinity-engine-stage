import Ember from 'ember';
import { BusSubscriberMixin } from 'ember-message-bus';
import { MultitonIdsMixin } from 'affinity-engine';

const {
  Evented,
  Service,
  getProperties,
  set
} = Ember;

export default Service.extend(BusSubscriberMixin, Evented, MultitonIdsMixin, {
  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._update);
  },

  setRecord(sceneRecord = {}) {
    return set(this, 'sceneRecord', sceneRecord);
  },

  _update(key, value) {
    set(this, `sceneRecord.${key}`, value);
  }
});
