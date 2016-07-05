import Ember from 'ember';

const {
  Service,
  get,
  getProperties
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Service.extend({
  direct(script, factory, predecessors, args) {
    if (get(script, 'isAborted')) { return resolve(); }

    const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');
    const direction = factory.create({ script, engineId, windowId });

    direction.trigger('directionReady', predecessors);

    return direction._setup(...args);
  }
});
