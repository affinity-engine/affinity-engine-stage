import Ember from 'ember';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Evented,
  Service
  // getProperties,
  // set
} = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, Evented, {
  // init(...args) {
  //   this._super(...args);
  //
  //   const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
  //
  //   this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._update);
  // },
  //
  // setRecord(sceneRecord = {}) {
  //   return set(this, 'sceneRecord', sceneRecord);
  // },
  //
  // _update(key, value) {
  //   set(this, `sceneRecord.${key}`, value);
  //
  //   const { engineId, sceneRecord } = getProperties(this, 'engineId', 'sceneRecord');
  //
  //   this.publish(`ae:${engineId}:shouldSetStateValue`, '_sceneRecord', sceneRecord);
  // }
});
