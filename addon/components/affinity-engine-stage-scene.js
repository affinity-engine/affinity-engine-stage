import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene';
import { ManagedFocusMixin, registrant } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  isPresent,
  set,
  setProperties
} = Ember;

const { Logger: { warn } } = Ember;

export default Component.extend(ManagedFocusMixin, {
  layout,

  classNames: ['ae-stage-scene'],

  dataManager: registrant('affinity-engine/data-manager'),
  eBus: multiton('message-bus', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  directables: computed(() => Ember.A()),
  layersMap: computed(() => Ember.Object.create()),

  init(...args) {
    this._super(...args);

    const esBus = get(this, 'esBus');

    esBus.subscribe('shouldRemoveDirectable', this, this._removeDirectable);
    esBus.subscribe('shouldAddDirectable', this, this._addDirectable);
    esBus.subscribe('shouldAddLayerDirectable', this, this._addLayerDirectable);
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

    if (isPresent(directable)) { directable.destroy(); }
  },

  _startScene() {
    const sceneOptions = get(this, 'sceneOptions');
    const sceneId = get(sceneOptions, 'sceneId');
    const data = get(this, 'dataManager.data');

    setProperties(this, {
      currentSceneId: sceneId
    });

    const { start, _sceneName } = this._buildScene(sceneId);
    const script = this._buildScript();

    if (isNone(start)) { return; }

    this._updateAutosave(sceneId, _sceneName);

    start.perform(script, data, get(sceneOptions, 'window'));
  },

  _buildScript() {
    const factory = getOwner(this).lookup('affinity-engine/stage:script');

    return factory.create(getProperties(this, 'engineId', 'stageId'));
  },

  _buildScene(id) {
    const factory = getOwner(this).lookup(`affinity-engine/stage/scene:${id}`);

    if (isNone(factory)) {
      warn(`Expected to find a scene with id '${id}'. None was found.`);

      return {};
    }

    const { engineId, stageId } = getProperties(this, 'engineId', 'stageId');
    const instance = factory.create({ engineId, stageId, _id: id });

    return getProperties(instance, '_sceneName', 'start');
  },

  _updateAutosave(sceneId, sceneName) {
    if (get(this, 'sceneOptions.autosave') === false) { return; }

    const eBus = get(this, 'eBus');

    eBus.publish('shouldSetStateValue', 'sceneId', sceneId);
    eBus.publish('shouldSetStateValue', 'sceneName', sceneName);
    eBus.publish('shouldFileStateBuffer');
    eBus.publish('shouldWriteAutosave');
  }
});
