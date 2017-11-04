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

  directions: computed(() => Ember.A()),
  layersMap: computed(() => Ember.Object.create()),

  init(...args) {
    this._super(...args);

    const esBus = get(this, 'esBus');

    esBus.subscribe('shouldRemoveDirection', this, this._removeDirection);
    esBus.subscribe('shouldAddDirection', this, this._addDirection);
    esBus.subscribe('shouldAddLayerDirection', this, this._addLayerDirection);
  },

  didReceiveAttrs(...args) {
    this._super(...args);

    if (get(this, '_oldSceneOptions') !== get(this, 'configuration')) {
      this._clearDirections();
      this._startScene();
      set(this, '_oldSceneOptions', get(this, 'configuration'));
    }
  },

  _addDirection(direction) {
    get(this, 'directions').pushObject(direction);
  },

  _addLayerDirection(layer, direction) {
    set(this, `layerDirectionsMap.${layer.replace(/\./g, '/')}`, direction);
  },

  _clearDirections() {
    get(this, 'directions').clear();
    set(this, 'layerDirectionsMap', Ember.Object.create());
  },

  _removeDirection(direction) {
    get(this, 'directions').removeObject(direction);

    if (isPresent(direction)) { direction.destroy(); }
  },

  _startScene() {
    const configuration = get(this, 'configuration');
    const sceneId = get(configuration, 'sceneId');

    setProperties(this, {
      currentSceneId: sceneId
    });

    const { start, _sceneName } = this._buildScene(sceneId);
    const script = this._buildScript();

    if (isNone(start)) { return; }

    this._updateAutosave(sceneId, _sceneName);

    start.perform(script, get(this, 'dataManager.data'), { window: get(configuration, 'windowDirection') });
  },

  _buildScript() {
    const factory = getOwner(this).factoryFor('affinity-engine/stage:script');

    return factory.create(getProperties(this, 'engineId', 'stageId'));
  },

  _buildScene(id) {
    const factory = getOwner(this).factoryFor(`affinity-engine/stage/scene:${id}`);

    if (isNone(factory)) {
      warn(`Expected to find a scene with id '${id}'. None was found.`);

      return {};
    }

    const { engineId, stageId } = getProperties(this, 'engineId', 'stageId');
    const instance = factory.create({ engineId, stageId, _id: id });

    return getProperties(instance, '_sceneName', 'start');
  },

  _updateAutosave(sceneId, sceneName) {
    if (get(this, 'configuration.autosave') === false) { return; }

    const eBus = get(this, 'eBus');
    const data = get(this, 'dataManager.data');

    setProperties(data, { sceneId, sceneName });

    eBus.publish('shouldFileStateBuffer');
    eBus.publish('shouldWriteAutosave');
  }
});
