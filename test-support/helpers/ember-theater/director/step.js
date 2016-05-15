import Ember from 'ember';

export default function(app, duration) {
  Ember.$(document).trigger('ember-theater-test-direction-step');

  return delay(duration);
}
