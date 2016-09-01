import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene';
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

export default Component.extend(BusPublisherMixin, BusSubscriberMixin, {
  layout,

  classNames: ['ae-stage-scene'],

  config: multiton('affinity-engine/config', 'engineId'),

  directables: computed(() => Ember.A()),

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:directionCompleted`, this, this._updateSceneRecord);
    this.on(`ae:${engineId}:${windowId}:shouldRemoveDirectable`, this, this._removeDirectable);
    this.on(`ae:${engineId}:${windowId}:shouldHandleDirectable`, this, this._handleDirectable);

    this._startScene();
  },

  didUpdateAttrs(...args) {
    this._super(...args);

    if (get(this, 'sceneId') !== get(this, 'currentSceneId')) {
      this._clearDirectables();
      this._startScene();
    }
  },

  _handleDirectable(properties, directableDefinition) {
    const directable = get(properties, 'direction.directable') || set(properties, 'direction.directable', this._addDirectable(directableDefinition));

    setProperties(directable, properties);
  },

  _addDirectable(directableDefinition = {}) {
    const directable = this._createDirectable(directableDefinition);

    get(this, 'directables').pushObject(directable);

    return directable;
  },

  _createDirectable(directableDefinition) {
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');

    return Directable.extend(directableDefinition).create();
  },

  _clearDirectables() {
    get(this, 'directables').clear();
  },

  _removeDirectable(directable) {
    get(this, 'directables').removeObject(directable);

    directable.destroy();
  },

  _startScene() {
    const { sceneId, sceneOptions } = getProperties(this, 'sceneId', 'sceneOptions');

    setProperties(this, {
      currentSceneId: sceneId,
      sceneRecord: get(sceneOptions, 'sceneRecord') || {}
    });

    const { start, sceneName } = this._buildScene(sceneId);
    const script = this._buildScript();

    if (isNone(start)) { return; }

    this._updateAutosave(sceneId, sceneName);

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
    const instance = factory.create({ engineId, windowId });

    return getProperties(instance, 'name', 'start');
  },

  _updateAutosave(sceneId, sceneName) {
    if (get(this, 'shouldAutosave') === false) { return; }

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
