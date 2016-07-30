import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import { ManagedFocusMixin } from 'affinity-engine';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties
} = Ember;

const { alias } = computed;

export default Component.extend(BusPublisherMixin, ManagedFocusMixin, {
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  windowId: 'main',

  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'windowId'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'engineId', 'windowId'),
  stageManager: multiton('affinity-engine/stage/stage-manager', 'engineId', 'windowId'),

  directables: alias('stageManager.directables'),

  didInsertElement(...args) {
    this._super(...args);

    const {
      initialScene,
      engineId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'engineId', 'windowId', 'window');

    this._initializeServices();

    if (windowId === 'main') {
      this.publish(`ae:${engineId}:shouldInitializeGame`, initialScene);
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      this.publish(`ae:${engineId}:${windowId}:shouldChangeScene`, initialScene, {
        autosave: false,
        sceneRecord,
        window
      });
    }
  },

  _initializeServices() {
    getProperties(this, 'layerManager', 'sceneManager', 'stageManager');
  }
});
