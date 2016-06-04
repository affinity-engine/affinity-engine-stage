import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin } from 'ember-message-bus';
import { MultitonIdsMixin, animate, deepConfigurable } from 'ember-theater';

const {
  get,
  getOwner,
  getProperties,
  isNone,
  typeOf
} = Ember;

const { run: { later } } = Ember;
const { Logger: { warn } } = Ember;

const configurationTiers = [
  'config.attrs.director.scene',
  'config.attrs.director',
  'config.attrs.globals'
];

export default MultitonService.extend(BusPublisherMixin, MultitonIdsMixin, {
  config: multiton('ember-theater/config', 'theaterId'),
  autosaveManager: multiton('ember-theater/autosave-manager', 'theaterId'),
  sceneManager: multiton('ember-theater/director/scene-manager', 'theaterId', 'windowId'),

  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),

  toScene(scene, options) {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');
    const query = windowId === 'main' ? '.et-director' : `[data-scene-window-id="${windowId}"] .et-director`;
    const $director = Ember.$(query);
    const transitionOut = get(this, 'transitionOut');
    const duration = get(options, 'transitionOut.duration') || get(transitionOut, 'duration');
    const effect = get(options, 'transitionOut.effect') || get(transitionOut, 'effect');

    this.publish(`et:${theaterId}:${windowId}:scriptsMustAbort`);

    animate($director, effect, { duration });

    later(() => {
      this._transitionScene(scene, options);

      later(() => $director.removeAttr('style'));
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
    const factory = getOwner(this).lookup(`ember-theater/director/scene:${id}`);

    if (isNone(factory)) {
      warn(`Expected to find a scene with id '${id}'. None was found.`);

      return;
    }

    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');
    const instance = factory.create({ theaterId, windowId });

    return {
      start: instance.start,
      sceneId: id,
      sceneName: get(instance, 'name')
    };
  },

  _buildScript() {
    const sceneManager = get(this, 'sceneManager');
    const factory = getOwner(this).lookup('ember-theater/director:script');
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');
    const sceneRecord = get(sceneManager, 'sceneRecord');

    return factory.create({ sceneRecord, theaterId, windowId });
  },

  _clearStage() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.publish(`et:${theaterId}:${windowId}:stageIsClearing`);
  },

  _setSceneManager(options) {
    const sceneManager = get(this, 'sceneManager');
    const sceneRecord = get(options, 'sceneRecord');

    sceneManager.setSceneRecord(sceneRecord);
  },

  _updateAutosave(sceneId, sceneName, options) {
    if (get(options, 'autosave') === false || get(this, 'config.attrs.director.scene.autosave') === false) { return; }

    const theaterId = get(this, 'theaterId');

    get(this, 'autosaveManager'); // initialize the autosave-manager

    this.publish(`et:${theaterId}:deletingStateValue`, '_sceneRecord');

    this.publish(`et:${theaterId}:appendingActiveState`, {
      sceneId,
      sceneName
    });

    this.publish(`et:${theaterId}:writingAutosave`);
  }
});
