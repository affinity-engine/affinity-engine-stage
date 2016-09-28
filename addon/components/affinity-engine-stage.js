import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage';
import { ManagedFocusMixin, configurable, deepConfigurable, registrant } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
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

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, ManagedFocusMixin, {
  layout,

  hook: 'affinity_engine_stage',

  classNames: ['ae-stage'],
  windowId: 'main',

  config: multiton('affinity-engine/config', 'engineId'),
  saveStateManager: registrant('affinity-engine/save-state-manager'),

  animationLibrary: configurable(configurationTiers, 'animationLibrary'),
  shouldAutosave: configurable(configurationTiers, 'autosave'),
  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),

  transitions: computed(() => Ember.A()),

  init(...args) {
    this._super(...args);

    const {
      initialScene,
      engineId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'engineId', 'windowId', 'window');

    this.on(`ae:${engineId}:${windowId}:restartingEngine`, this, this._toInitialScene);
    this.on(`ae:${engineId}:${windowId}:shouldLoadScene`, this, this._loadScene);
    this.on(`ae:${engineId}:${windowId}:shouldLoadSceneFromPoint`, this, this._loadSceneFromPoint);
    this.on(`ae:${engineId}:${windowId}:shouldStartScene`, this, this._startScene);
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

  _loadSceneFromPoint(point) {
    this._startScene(get(point, 'lastObject.sceneId'), {
      autosave: false
    });
  },

  _changeScene(sceneId, sceneOptions) {
    this._startScene(sceneId, sceneOptions);
  },

  _startScene(sceneId, sceneOptions) {
    set(this, 'sceneIsChanging', true);
    set(this, 'sceneOptions', sceneOptions);

    const { transitionIn, transitionOut } = getProperties(this, 'transitionIn', 'transitionOut');

    get(this, 'transitions').pushObject({
      crossFade: {
        in: transitionIn,
        out: transitionOut,
        cb: () => {
          set(this, 'sceneId', sceneId);
        }
      }
    });
  },

  actions: {
    sceneHasChanged() {
      set(this, 'sceneIsChanging', false);
    }
  }
});
