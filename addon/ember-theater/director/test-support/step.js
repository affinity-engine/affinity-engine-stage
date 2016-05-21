import Ember from 'ember';

const { run } = Ember;
const { RSVP: { Promise } } = Ember;

export default function() {
  return new Promise((resolve) => {
    Ember.$(document).on('ember-theater-test-direction-step', () => {
      run(() => {
        resolve();
      });
    });
  });
}
