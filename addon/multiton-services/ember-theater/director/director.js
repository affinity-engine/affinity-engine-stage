import Ember from 'ember';
import { MultitonService } from 'ember-multiton-service';
import { MultitonIdsMixin } from 'ember-theater';

const {
  get,
  getProperties
} = Ember;

const { RSVP: { resolve } } = Ember;

export default MultitonService.extend(MultitonIdsMixin, {
  direct(script, factory, args) {
    if (get(script, 'isAborted')) { return resolve(); }

    const { theaterId, windowId } = getProperties(this, 'theaterId', 'windowId');
    const direction = factory.create({ script, theaterId, windowId });
    const predecessors = get(args[0], 'arePredecessors') ? args.shift() : Ember.A();

    direction.trigger('directionReady', predecessors);

    return direction._setup(...args);
  }
});
