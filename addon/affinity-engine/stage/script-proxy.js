import Ember from 'ember';

const {
  get
} = Ember;

export default Ember.Object.extend({
  _executeDirection(directionName, args) {
    const predecessors = get(this, 'predecessors');

    predecessors[0].trigger('willChainDirection', directionName, args);

    return get(this, 'script')[directionName](predecessors, ...args);
  }
});
