import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import { ManagedFocusMixin, registrant } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Component,
  get,
  getProperties,
  isPresent,
  setProperties
} = Ember;

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, ManagedFocusMixin, {
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  windowId: 'main',

  saveStateManager: registrant('affinity-engine/save-state-manager'),

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
