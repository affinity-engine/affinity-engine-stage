import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Mixin,
  get,
  isBlank,
  isPresent,
  set
} = Ember;

const { computed: { alias } } = Ember;

export default Mixin.create({
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  priorSceneRecord: alias('directable.priorSceneRecord'),

  init(...args) {
    this._super(...args);

    const directable = get(this, 'directable');

    if (isBlank(directable)) { return; }

    set(directable, 'component', this);
  },

  resolveAndDestroy() {
    this.resolve();
    this.removeDirectable();
  },

  resolve() {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const direction = get(this, 'directable.direction');

    if (isPresent(direction)) { direction.resolve(); }
  },

  removeDirectable() {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const directable = get(this, 'directable');

    get(this, 'esBus').publish('shouldRemoveDirectable', directable);
  }
});
