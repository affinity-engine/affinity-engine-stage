import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import multiton from 'ember-multiton-service';
import { BusSubscriberMixin } from 'ember-message-bus';
import MultitonIdsMixin from 'ember-theater/mixins/ember-theater/multiton-ids';

const {
  get,
  getProperties,
  set
} = Ember;

const { computed: { alias } } = Ember;

export default MultitonService.extend(BusSubscriberMixin, MultitonIdsMixin, {
  curtainPulley: multiton('ember-theater/director/scene/curtain-pulley', 'theaterId', 'windowId'),
  recorder: multiton('ember-theater/director/scene/recorder', 'theaterId', 'windowId'),
  transitionManager: multiton('ember-theater/director/scene/transition-manager', 'theaterId', 'windowId'),

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
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.on(`et:${theaterId}:gameIsRewinding`, this, this.rewindToScene);
    this.on(`et:${theaterId}:gameIsInitializing`, this, this.intializeGame);
    this.on(`et:${theaterId}:${windowId}:sceneIsChanging`, this, this.toScene);
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
