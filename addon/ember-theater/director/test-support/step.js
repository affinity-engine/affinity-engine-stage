import Ember from 'ember';

const { RSVP: { Promise } } = Ember;

export default function() {
  return new Promise((resolve) => {
    Ember.$(document).on('ember-theater-test-direction-step', () => {
      resolve();
    });
  });
}
