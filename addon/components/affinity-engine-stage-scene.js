import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene';
import { deepConfigurable } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  getOwner,
  getProperties,
  isBlank,
  isNone,
  merge,
  set,
  setProperties,
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

  directables: computed(() => Ember.A()),

  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),
  animationAdapter: alias('config.attrs.affinity-engine.animator.name'),

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._update);
    this.on(`ae:${engineId}:${windowId}:shouldClearStage`, this, this._clearDirectables);
    this.on(`ae:${engineId}:${windowId}:shouldRemoveDirectable`, this, this._removeDirectable);
    this.on(`ae:${engineId}:${windowId}:shouldHandleDirectable`, this, this._handleDirectable);

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

  _handleDirectable(id, properties, resolve) {
    const directable = get(properties, 'direction.directable');

    if (isBlank(directable)) {
      this._addDirectable(merge(properties, { id, resolve }));
    } else {
      this._updateDirectable(directable, properties, resolve);
    }
  },

  _addDirectable(properties) {
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');
    const directable = Directable.create(properties);

    set(get(properties, 'direction'), 'directable', directable);

    get(this, 'directables').pushObject(directable);
  },

  _updateDirectable(directable, properties, resolve) {
    const attrs = Ember.$.extend({}, get(directable, 'attrs'), get(properties, 'attrs'));

    setProperties(directable, merge(properties, { resolve, attrs }));
  },

  _clearDirectables() {
    get(this, 'directables').clear();
  },

  _removeDirectable(directable) {
    get(this, 'directables').removeObject(directable);
    directable.destroy();
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
