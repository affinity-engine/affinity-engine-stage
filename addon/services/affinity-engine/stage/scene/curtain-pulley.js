import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import { registrant } from 'affinity-engine';

const {
  Service,
  get,
  getProperties,
  isNone,
  isPresent
} = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, {
  saveStateManager: registrant('affinity-engine/save-state-manager'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'engineId', 'windowId'),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:${engineId}:restartingEngine`, this, this.toInitialScene);
    this.on(`ae:${engineId}:shouldLoadScene`, this, this.loadScene);
  },

  loadLatestScene() {
    const saveStateManager = get(this, 'saveStateManager');
    const options = { autosave: false };

    if (isNone(saveStateManager) || get(saveStateManager, 'isPlaceholder')) {
      return this.toInitialScene();
    }

    saveStateManager.get('mostRecentSave').then((save) => {
      if (isPresent(save)) {
        const sceneId = get(save, 'activeState.sceneId');

        this.loadScene(save, sceneId, options);
      } else {
        this.toInitialScene();
      }
    });
  },

  toInitialScene() {
    const sceneId = get(this, 'sceneManager.initialScene');

    get(this, 'sceneManager').startScene(sceneId, { autosave: false });
  },

  loadScene(save, sceneId, options) {
    const {
      saveStateManager,
      sceneManager,
      engineId
    } = getProperties(this, 'saveStateManager', 'sceneManager', 'engineId');

    this.publish(`ae:${engineId}:shouldLoadSave`, save);
    this.publish(`ae:${engineId}:refreshingFromState`);

    options.sceneRecord = saveStateManager.getStateValue('_sceneRecord') || {};

    sceneManager.toScene(sceneId, options);
  }
});
