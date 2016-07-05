import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusSubscriberMixin } from 'ember-message-bus';
import { MultitonIdsMixin } from 'affinity-engine';

const {
  Service,
  get,
  getProperties,
  set
} = Ember;

const { computed: { alias } } = Ember;

export default Service.extend(BusSubscriberMixin, MultitonIdsMixin, {
  curtainPulley: multiton('affinity-engine/stage/scene/curtain-pulley', 'engineId', 'windowId'),
  recorder: multiton('affinity-engine/stage/scene/recorder', 'engineId', 'windowId'),
  transitionManager: multiton('affinity-engine/stage/scene/transition-manager', 'engineId', 'windowId'),

  sceneRecord: alias('recorder.sceneRecord'),

  init() {
    this._initializeServices();
    this._setupEvents();

    this._super();
  },

  _initializeServices() {
    getProperties(this, 'curtainPulley', 'recorder', 'transitionManager');
  },

  _setupEvents() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:shouldLoadLatestStatePoint`, this, this.rewindToScene);
    this.on(`ae:${engineId}:gameIsInitializing`, this, this.intializeGame);
    this.on(`ae:${engineId}:${windowId}:sceneIsChanging`, this, this.toScene);
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

  toScene(id, options = {}) {
    get(this, 'transitionManager').toScene(id, options);
  },

  setScript(script) {
    set(this, 'script', script);
  },

  advanceSceneRecord() {
    return get(this, 'recorder').advance();
  },

  recordSceneRecordEvent(promise, script) {
    get(this, 'recorder').record(promise, script);
  },

  setSceneRecord(sceneRecord) {
    return get(this, 'recorder').setRecord(sceneRecord);
  }
});
