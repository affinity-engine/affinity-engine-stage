import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  config: {
    director: {
      scene: {
        transitionOut: {
          duration: 0
        }
      }
    }
  },
  fixtures: {
  }
});
