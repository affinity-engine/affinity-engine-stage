import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene';
import { ManagedFocusMixin } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  set,
  setProperties
} = Ember;

const { Logger: { warn } } = Ember;

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, ManagedFocusMixin, {
  layout,

  classNames: ['ae-stage-scene'],

  config: multiton('affinity-engine/config', 'engineId'),

  directables: computed(() => Ember.A()),
  layersMap: computed(() => Ember.Object.create()),

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._updateSceneRecord);
    this.on(`ae:${engineId}:${windowId}:shouldRemoveDirectable`, this, this._removeDirectable);
    this.on(`ae:${engineId}:${windowId}:shouldAddDirectable`, this, this._addDirectable);
    this.on(`ae:${engineId}:${windowId}:shouldAddLayerDirectable`, this, this._addLayerDirectable);
  },

  didReceiveAttrs(...args) {
    this._super(...args);

    if (get(args[0], 'newAttrs.sceneOptions.value') !== get(args[0], 'oldAttrs.sceneOptions.value')) {
      this._clearDirectables();
      this._startScene();
    }
  },

  _addDirectable(directable) {
    get(this, 'directables').pushObject(directable);
  },

  _addLayerDirectable(layer, directable) {
    set(this, `layerDirectablesMap.${layer.replace('.', '/')}`, directable);
  },

  _clearDirectables() {
    get(this, 'directables').clear();
    set(this, 'layerDirectablesMap', Ember.Object.create());
  },

  _removeDirectable(directable) {
    get(this, 'directables').removeObject(directable);

    directable.destroy();
  },

  _startScene() {
    const sceneOptions = get(this, 'sceneOptions');
    const sceneId = get(sceneOptions, 'sceneId');

    setProperties(this, {
      currentSceneId: sceneId,
      sceneRecord: get(sceneOptions, 'sceneRecord') || {}
    });

    const { start, _sceneName } = this._buildScene(sceneId);
    const script = this._buildScript();

    if (isNone(start)) { return; }

    this._updateAutosave(sceneId, _sceneName);

    start.perform(script, get(sceneOptions, 'window'));
  },

  _buildScript() {
    const factory = getOwner(this).lookup('affinity-engine/stage:script');

    return factory.create(getProperties(this, 'engineId', 'sceneRecord', 'windowId'));
  },

  _buildScene(id) {
    const factory = getOwner(this).lookup(`affinity-engine/stage/scene:${id}`);

    if (isNone(factory)) {
      warn(`Expected to find a scene with id '${id}'. None was found.`);

      return {};
    }

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const instance = factory.create({ engineId, windowId, _id: id });

    return getProperties(instance, '_sceneName', 'start');
  },

  _updateAutosave(sceneId, sceneName) {
    if (get(this, 'sceneOptions.autosave') === false) { return; }

    const engineId = get(this, 'engineId');

    this.publish(`ae:${engineId}:shouldDeleteStateValue`, '_sceneRecord');
    this.publish(`ae:${engineId}:shouldSetStateValues`, {
      sceneId,
      sceneName
    });
    this.publish(`ae:${engineId}:shouldFileActiveState`);
    this.publish(`ae:${engineId}:shouldWriteAutosave`);
  },

  _updateSceneRecord(key, value) {
    set(this, `sceneRecord.${key}`, value);

    const { engineId, sceneRecord } = getProperties(this, 'engineId', 'sceneRecord');

    this.publish(`ae:${engineId}:shouldSetStateValue`, '_sceneRecord', sceneRecord);
  }
});
