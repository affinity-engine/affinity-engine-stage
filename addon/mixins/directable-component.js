import Ember from 'ember';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Mixin,
  get,
  getProperties,
  isBlank,
  isPresent,
  set
} = Ember;

const { computed: { alias } } = Ember;

export default Mixin.create(BusPublisherMixin, {
  priorSceneRecord: alias('directable.priorSceneRecord'),

  init(...args) {
    this._super(...args);

    const directable = get(this, 'directable');

    if (isBlank(directable)) { return; }

    set(directable, 'component', this);
  },

  resolveAndDestroy() {
    this.removeDirectable();
    this.resolve();
  },

  resolve() {
    const directable = get(this, 'directable');

    if (isBlank(directable)) { return; }

    const { direction, resolve } = getProperties(directable, 'direction', 'resolve');

    if (isPresent(resolve)) {
      resolve(direction);
    }
  },

  removeDirectable() {
    const { directable, engineId, windowId } = getProperties(this, 'directable', 'engineId', 'windowId');

    this.publish(`et:${engineId}:${windowId}:removingDirectable`, directable);
  }
});
