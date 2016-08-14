import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene';
import { deepConfigurable } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Component,
  get,
  getOwner,
  getProperties,
  isNone,
  set,
  typeOf
} = Ember;

const { computed: { alias } } = Ember;
const { Logger: { warn } } = Ember;

const configurationTiers = [
  'sceneOptions',
  'config.attrs.component.stage.scene',
  'config.attrs.component.stage',
  'config.attrs'
];

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, {
  layout,

  classNames: ['ae-stage-scene'],

  config: multiton('affinity-engine/config', 'engineId'),

  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),
  animationAdapter: alias('config.attrs.affinity-engine.animator.name'),

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._update);

    set(this, 'currentSceneId', get(this, 'sceneId'));
    this._startScene();
  },

  didUpdateAttrs(...args) {
    this._super(...args);

    if (get(this, 'sceneId') !== get(this, 'currentSceneId')) {
      set(this, 'currentSceneId', get(this, 'sceneId'));
      this.rerender();
      this._startScene();
    }
  },

  _startScene() {
    const { sceneId: scene, sceneOptions, transitionIn, transitionOut } = getProperties(this, 'sceneId', 'sceneOptions', 'transitionIn', 'transitionOut');

    set(this, 'transitions', [{ crossFade: { in: transitionIn, out: transitionOut } }]);

    set(this, 'sceneRecord', get(sceneOptions, 'sceneRecord') || {});

    this._clearStage();

    const script = this._buildScript();

    const sceneBundle = typeOf(scene) === 'function' ?
      { start: scene } :
      this._buildScene(scene);

    if (isNone(sceneBundle)) { return; }

    const { start, sceneId, sceneName } = getProperties(sceneBundle, 'start', 'sceneId', 'sceneName');

    this._updateAutosave(sceneId, sceneName, sceneOptions);

    start(script, get(sceneOptions, 'window'));
  },

  _buildScript() {
    const factory = getOwner(this).lookup('affinity-engine/stage:script');

    return factory.create(getProperties(this, 'engineId', 'sceneRecord', 'windowId'));
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

  _clearStage() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.publish(`ae:${engineId}:${windowId}:shouldClearStage`);
  },

  _updateAutosave(sceneId, sceneName, options) {
    if (get(options, 'autosave') === false || get(this, 'config.attrs.stage.scene.autosave') === false) { return; }

    const engineId = get(this, 'engineId');

    this.publish(`ae:${engineId}:shouldDeleteStateValue`, '_sceneRecord');
    this.publish(`ae:${engineId}:shouldSetStateValues`, {
      sceneId,
      sceneName
    });
    this.publish(`ae:${engineId}:shouldFileActiveState`);
    this.publish(`ae:${engineId}:shouldWriteAutosave`);
  },

  _update(key, value) {
    set(this, `sceneRecord.${key}`, value);

    const { engineId, sceneRecord } = getProperties(this, 'engineId', 'sceneRecord');

    this.publish(`ae:${engineId}:shouldSetStateValue`, '_sceneRecord', sceneRecord);
  }
});
