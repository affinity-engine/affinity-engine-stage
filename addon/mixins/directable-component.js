import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Mixin,
  get,
  isBlank,
  isPresent,
  set
} = Ember;

export default Mixin.create({
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  init(...args) {
    this._super(...args);

    const direction = get(this, 'direction');

    if (isBlank(direction)) { return; }

    set(direction, 'component', this);
  },

  resolveAndDestroy(...args) {
    this.resolve(...args);
    this.removeDirection();
  },

  resolve(...args) {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const direction = get(this, 'direction');

    if (isPresent(direction)) { direction.resolve(...args); }
  },

  removeDirection() {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const direction = get(this, 'direction');

    get(this, 'esBus').publish('shouldRemoveDirection', direction);
  }
});
