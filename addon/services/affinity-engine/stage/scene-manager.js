import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusSubscriberMixin } from 'ember-message-bus';

const {
  Service,
  get,
  getProperties,
  set
} = Ember;

const { computed: { alias } } = Ember;

export default Service.extend(BusSubscriberMixin, {
  curtainPulley: multiton('affinity-engine/stage/scene/curtain-pulley', 'engineId', 'windowId'),
  recorder: multiton('affinity-engine/stage/scene/recorder', 'engineId', 'windowId'),
  transitionManager: multiton('affinity-engine/stage/scene/transition-manager', 'engineId', 'windowId'),

  sceneRecord: alias('recorder.sceneRecord'),

  init(...args) {
    this._super(...args);

    this._initializeServices();
    this._setupEvents();
  },

  _initializeServices() {
    getProperties(this, 'curtainPulley', 'recorder', 'transitionManager');
  },

  _setupEvents() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:shouldLoadLatestStatePoint`, this, this.rewindToScene);
    this.on(`ae:${engineId}:shouldInitializeGame`, this, this.intializeGame);
    this.on(`ae:${engineId}:${windowId}:shouldStartScene`, this, this.startScene);
    this.on(`ae:${engineId}:${windowId}:shouldChangeScene`, this, this.toScene);
  },

  intializeGame(initialScene) {
    set(this, 'initialScene', initialScene);

    this.loadLatestScene();
  },

  loadLatestScene() {
    get(this, 'curtainPulley').loadLatestScene();
  },

  loadScene(save, sceneId, options) {
    get(this, 'curtainPulley').loadScene(save, sceneId, options);
  },

  resetGame() {
    get(this, 'curtainPulley').resetGame();
  },

  rewindToScene(point) {
    this.toScene(get(point, 'lastObject.sceneId'), {
      autosave: false
    });
  },

  startScene(id, options = {}) {
    get(this, 'transitionManager').startScene(id, options);
  },

  toScene(id, options = {}) {
    get(this, 'transitionManager').toScene(id, options);
  },

  setScript(script) {
    set(this, 'script', script);
  },

  setSceneRecord(sceneRecord) {
    return get(this, 'recorder').setRecord(sceneRecord);
  }
});
