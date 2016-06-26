import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import { MultitonIdsMixin } from 'affinity-engine';
import { BusSubscriberMixin } from 'ember-message-bus';
import { DirectableManagerMixin } from 'affinity-engine-stage';

const {
  Evented,
  computed,
  get,
  getProperties
} = Ember;

export default MultitonService.extend(BusSubscriberMixin, DirectableManagerMixin, Evented, MultitonIdsMixin, {
  directables: computed(() => Ember.A()),

  init() {
    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

    this.on(`et:${engineId}:${windowId}:stageIsClearing`, this, this.clearDirectables);
    this.on(`et:${engineId}:${windowId}:removingDirectable`, this, this.removeDirectable);

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
