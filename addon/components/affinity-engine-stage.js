import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import { ManagedFocusMixin, registrant } from 'affinity-engine';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties,
  isPresent,
  setProperties
} = Ember;

const { alias } = computed;

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, ManagedFocusMixin, {
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  windowId: 'main',

  layerManager: multiton('affinity-engine/stage/layer-manager', 'engineId', 'windowId'),
  saveStateManager: registrant('affinity-engine/save-state-manager'),
  stageManager: multiton('affinity-engine/stage/stage-manager', 'engineId', 'windowId'),

  directables: alias('stageManager.directables'),

  init(...args) {
    this._super(...args);

    const {
      initialScene,
      engineId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'engineId', 'windowId', 'window');

    this.on(`ae:${engineId}:${windowId}:shouldLoadLatestStatePoint`, this, this._rewindToScene);
    this.on(`ae:${engineId}:${windowId}:shouldStartScene`, this, this._startScene);
    this.on(`ae:${engineId}:${windowId}:shouldLoadScene`, this, this._loadScene);
    this.on(`ae:${engineId}:${windowId}:shouldChangeScene`, this, this._changeScene);

    this._initializeServices();

    if (windowId === 'main') {
      this._loadLatestScene();
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      this._startScene(initialScene, {
        autosave: false,
        sceneRecord,
        window
      });
    }
  },

  _initializeServices() {
    getProperties(this, 'layerManager', 'stageManager');
  },

  _rewindToScene(point) {
    this._startScene(get(point, 'lastObject.sceneId'), {
      autosave: false
    });
  },

  _loadLatestScene() {
    const saveStateManager = get(this, 'saveStateManager');
    const options = { autosave: false };

    if (get(saveStateManager, 'isPlaceholder')) {
      return this._toInitialScene();
    }

    saveStateManager.get('mostRecentSave').then((save) => {
      if (isPresent(save)) {
        const sceneId = get(save, 'activeState.sceneId');

        this._loadScene(save, sceneId, options);
      } else {
        this._toInitialScene();
      }
    });
  },

  _toInitialScene() {
    const sceneId = get(this, 'initialScene');

    this._startScene(sceneId, { autosave: false });
  },

  _loadScene(save, sceneId, options) {
    const {
      saveStateManager,
      engineId
    } = getProperties(this, 'saveStateManager', 'engineId');

    this.publish(`ae:${engineId}:shouldLoadSave`, save);
    this.publish(`ae:${engineId}:refreshingFromState`);

    options.sceneRecord = saveStateManager.getStateValue('_sceneRecord') || {};

    this._startScene(sceneId, options);
  },

  _changeScene(sceneId, sceneOptions) {
    this._startScene(sceneId, sceneOptions);
  },

  _startScene(sceneId, sceneOptions) {
    setProperties(this, {
      sceneId,
      sceneOptions
    });
  }
});
