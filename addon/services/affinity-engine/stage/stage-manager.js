import Ember from 'ember';
import { BusSubscriberMixin } from 'ember-message-bus';
import { DirectableManagerMixin } from 'affinity-engine-stage';

const {
  Evented,
  Service,
  computed,
  get,
  getProperties
} = Ember;

export default Service.extend(BusSubscriberMixin, DirectableManagerMixin, Evented, {
  directables: computed(() => Ember.A()),

  init(...args) {
    this._super(...args);

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:shouldClearStage`, this, this.clearDirectables);
    this.on(`ae:${engineId}:${windowId}:removingDirectable`, this, this.removeDirectable);
  },

  clearDirectables() {
    get(this, 'directables').clear();
  },

  removeDirectable(directable) {
    get(this, 'directables').removeObject(directable);
    directable.destroy();
  },

  _addNewDirectable(properties) {
    this._super(properties);

    const directable = get(properties, 'direction.directable');

    get(this, 'directables').pushObject(directable);
  }
});
