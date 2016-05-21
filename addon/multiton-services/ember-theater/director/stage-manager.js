import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import { MultitonIdsMixin } from 'ember-theater';
import { BusSubscriberMixin } from 'ember-message-bus';
import { DirectableManagerMixin } from 'ember-theater-director';

const {
  Evented,
  computed,
  get,
  getProperties
} = Ember;

export default MultitonService.extend(BusSubscriberMixin, DirectableManagerMixin, Evented, MultitonIdsMixin, {
  directables: computed(() => Ember.A()),

  init() {
    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');

    this.on(`et:${theaterId}:${windowId}:stageIsClearing`, this, this.clearDirectables);
    this.on(`et:${theaterId}:${windowId}:removingDirectable`, this, this.removeDirectable);

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
