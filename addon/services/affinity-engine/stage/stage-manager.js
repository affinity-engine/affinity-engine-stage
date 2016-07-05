import Ember from 'ember';
import { MultitonIdsMixin } from 'affinity-engine';
import { BusSubscriberMixin } from 'ember-message-bus';
import { DirectableManagerMixin } from 'affinity-engine-stage';

const {
  Evented,
  Service,
  computed,
  get,
  getProperties
} = Ember;

export default Service.extend(BusSubscriberMixin, DirectableManagerMixin, Evented, MultitonIdsMixin, {
  directables: computed(() => Ember.A()),

  init() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`ae:${engineId}:${windowId}:stageIsClearing`, this, this.clearDirectables);
    this.on(`ae:${engineId}:${windowId}:removingDirectable`, this, this.removeDirectable);

    this._super();
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
