import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import { BusSubscriberMixin } from 'ember-message-bus';
import { MultitonIdsMixin } from 'affinity-engine';

const {
  Evented,
  getProperties,
  on,
  set
} = Ember;

export default MultitonService.extend(BusSubscriberMixin, Evented, MultitonIdsMixin, {
  setupEvents: on('init', function() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`et:${engineId}:${windowId}:directionCompleted`, this, this._update);
  }),

  setRecord(sceneRecord = {}) {
    return set(this, 'sceneRecord', sceneRecord);
  },

  _update(key, value) {
    set(this, `sceneRecord.${key}`, value);
  }
});
