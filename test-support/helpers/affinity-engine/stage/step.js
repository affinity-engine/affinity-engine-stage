import Ember from 'ember';

export default function(app, duration) {
  Ember.$(document).trigger('affinity-engine-test-direction-step');

  return delay(duration);
}
