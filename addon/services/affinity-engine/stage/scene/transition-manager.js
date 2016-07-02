import Ember from 'ember';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin } from 'ember-message-bus';
import { MultitonIdsMixin, animate, deepConfigurable } from 'affinity-engine';

const {
  Service,
  get,
  getOwner,
  getProperties,
  isNone,
  typeOf
} = Ember;

const { run: { later } } = Ember;
const { Logger: { warn } } = Ember;

const configurationTiers = [
  'config.attrs.stage.scene',
  'config.attrs.stage',
  'config.attrs.globals'
];

export default Service.extend(BusPublisherMixin, MultitonIdsMixin, {
  config: multiton('affinity-engine/config', 'engineId'),
  autosaveManager: multiton('affinity-engine/autosave-manager', 'engineId'),
  sceneManager: multiton('affinity-engine/stage/scene-manager', 'engineId', 'windowId'),

  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),

  toScene(scene, options) {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const query = windowId === 'main' ? '.et-stage' : `[data-scene-window-id="${windowId}"] .et-stage`;
    const $stage = Ember.$(query);
    const transitionOut = get(this, 'transitionOut');
    const duration = get(options, 'transitionOut.duration') || get(transitionOut, 'duration');
    const effect = get(options, 'transitionOut.effect') || get(transitionOut, 'effect');

    this.publish(`et:${engineId}:${windowId}:scriptsMustAbort`);

    animate($stage, effect, { duration });

    later(() => {
      this._transitionScene(scene, options);

      later(() => $stage.removeAttr('style'));
    }, duration);
  },

  _transitionScene(scene, options) {
    this._clearStage();
    this._setSceneManager(options);

    const script = this._buildScript();

    const sceneBundle = typeOf(scene) === 'function' ?
      { start: scene } :
      this._buildScene(scene);

    if (isNone(sceneBundle)) { return; }

    const { start, sceneId, sceneName } = getProperties(sceneBundle, 'start', 'sceneId', 'sceneName');

    this._updateAutosave(sceneId, sceneName, options);

    start(script, get(options, 'window'));
  },

  _buildScene(id) {
    const factory = getOwner(this).lookup(`affinity-engine/stage/scene:${id}`);

    if (isNone(factory)) {
      warn(`Expected to find a scene with id '${id}'. None was found.`);

      return;
    }

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const instance = factory.create({ engineId, windowId });

    return {
      start: instance.start,
      sceneId: id,
      sceneName: get(instance, 'name')
    };
  },

  _buildScript() {
    const sceneManager = get(this, 'sceneManager');
    const factory = getOwner(this).lookup('affinity-engine/stage:script');
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const sceneRecord = get(sceneManager, 'sceneRecord');

    return factory.create({ sceneRecord, engineId, windowId });
  },

  _clearStage() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.publish(`et:${engineId}:${windowId}:stageIsClearing`);
  },

  _setSceneManager(options) {
    const sceneManager = get(this, 'sceneManager');
    const sceneRecord = get(options, 'sceneRecord');

    sceneManager.setSceneRecord(sceneRecord);
  },

  _updateAutosave(sceneId, sceneName, options) {
    if (get(options, 'autosave') === false || get(this, 'config.attrs.stage.scene.autosave') === false) { return; }

    const engineId = get(this, 'engineId');

    get(this, 'autosaveManager'); // initialize the autosave-manager

    this.publish(`et:${engineId}:deletingStateValue`, '_sceneRecord');

    this.publish(`et:${engineId}:appendingActiveState`, {
      sceneId,
      sceneName
    });

    this.publish(`et:${engineId}:writingAutosave`);
  }
});