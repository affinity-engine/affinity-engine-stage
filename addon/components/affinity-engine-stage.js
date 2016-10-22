import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import { configurable, deepConfigurable, registrant } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  getProperties,
  isPresent,
  set
} = Ember;

const configurationTiers = [
  'sceneOptions',
  'config.attrs.component.stage.scene',
  'config.attrs.component.stage',
  'config.attrs'
];

export default Component.extend({
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  stageId: 'main',

  config: multiton('affinity-engine/config', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  dataManager: registrant('affinity-engine/data-manager'),

  animationLibrary: configurable(configurationTiers, 'animationLibrary'),
  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),

  transitions: computed(() => Ember.A()),

  init(...args) {
    this._super(...args);

    const {
      initialScene,
      eBus,
      esBus,
      stageId,
      window
    } = getProperties(this, 'initialScene', 'eBus', 'esBus', 'stageId', 'window');

    esBus.subscribe('shouldLoadScene', this, this._loadScene);
    esBus.subscribe('shouldStartScene', this, this._startScene);
    esBus.subscribe('shouldChangeScene', this, this._changeScene);

    if (stageId === 'main') {
      eBus.subscribe('restartingEngine', this, this._toInitialScene);
      eBus.subscribe('shouldLoadSceneFromPoint', this, this._loadSceneFromPoint);

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

  _loadLatestScene() {
    const dataManager = get(this, 'dataManager');
    const options = { autosave: false };

    if (get(dataManager, 'isPlaceholder')) {
      return this._toInitialScene();
    }

    dataManager.get('mostRecentSave').then((save) => {
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
      dataManager,
      eBus
    } = getProperties(this, 'dataManager', 'eBus');

    eBus.publish('shouldLoadSave', save);
    eBus.publish('refreshingFromState');

    options.sceneRecord = dataManager.getStateValue('_sceneRecord') || {};

    this._startScene(sceneId, options);
  },

  _loadSceneFromPoint(point) {
    this._startScene(get(point, 'lastObject.sceneId'), {
      autosave: false
    });
  },

  _changeScene(sceneId, sceneOptions) {
    this._startScene(sceneId, sceneOptions);
  },

  _startScene(sceneId, sceneOptions) {
    set(sceneOptions, 'sceneId', sceneId);

    const { transitionIn, transitionOut } = getProperties(this, 'transitionIn', 'transitionOut');

    get(this, 'transitions').pushObject({
      crossFade: {
        in: transitionIn,
        out: transitionOut,
        cb: () => {
          set(this, 'sceneOptions', sceneOptions);
        }
      }
    });
  }
});
