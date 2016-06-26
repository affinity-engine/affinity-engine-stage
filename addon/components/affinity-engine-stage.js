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

  hook: 'ember_theater_stage',

  classNames: ['et-stage'],
  windowId: 'main',

  producer: multiton('affinity-engine/producer', 'theaterId'),
  layerManager: multiton('affinity-engine/stage/layer-manager', 'theaterId', 'windowId'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'theaterId', 'windowId'),
  stageManager: multiton('affinity-engine/stage/stage-manager', 'theaterId', 'windowId'),

  directables: alias('stageManager.directables'),

  didInsertElement() {
    const {
      initialScene,
      theaterId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'theaterId', 'windowId', 'window');

    this._initializeServices();

    if (windowId === 'main') {
      this.publish(`et:${theaterId}:gameIsInitializing`, initialScene);
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      this.publish(`et:${theaterId}:${windowId}:sceneIsChanging`, initialScene, {
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
