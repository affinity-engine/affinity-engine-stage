import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties
} = Ember;

const { alias } = computed;

export default Component.extend(BusPublisherMixin, {
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  windowId: 'main',

  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'windowId'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'engineId', 'windowId'),
  stageManager: multiton('affinity-engine/stage/stage-manager', 'engineId', 'windowId'),

  directables: alias('stageManager.directables'),

  didInsertElement() {
    const {
      initialScene,
      engineId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'engineId', 'windowId', 'window');

    this._initializeServices();

    if (windowId === 'main') {
      this.publish(`et:${engineId}:gameIsInitializing`, initialScene);
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      this.publish(`et:${engineId}:${windowId}:sceneIsChanging`, initialScene, {
        autosave: false,
        sceneRecord,
        window
      });
    }

    this._super();
  },

  _initializeServices() {
    getProperties(this, 'layerManager', 'sceneManager', 'stageManager');
  }
});
