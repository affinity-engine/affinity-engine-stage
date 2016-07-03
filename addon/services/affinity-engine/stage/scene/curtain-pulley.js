import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import { MultitonIdsMixin } from 'affinity-engine';

const {
  Service,
  get,
  getProperties,
  isPresent
} = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, MultitonIdsMixin, {
  saveStateManager: multiton('affinity-engine/save-state-manager', 'engineId'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'engineId', 'windowId'),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`et:${engineId}:gameIsResetting`, this, this.toInitialScene);
    this.on(`et:${engineId}:saveIsLoading`, this, this.loadScene);
  },

  loadLatestScene() {
    const saveStateManager = get(this, 'saveStateManager');
    const options = { autosave: false };

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

    get(this, 'sceneManager').toScene(sceneId, { autosave: false });
  },

  loadScene(save, sceneId, options) {
    const {
      saveStateManager,
      sceneManager,
      engineId
    } = getProperties(this, 'saveStateManager', 'sceneManager', 'engineId');

    saveStateManager.loadRecord(save);

    this.publish(`et:${engineId}:reseting`);

    options.sceneRecord = saveStateManager.getStateValue('_sceneRecord') || {};

    sceneManager.toScene(sceneId, options);
  }
});
