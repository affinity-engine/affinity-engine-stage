import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  config: {
    stage: {
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
