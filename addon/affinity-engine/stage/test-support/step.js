import Ember from 'ember';

const { run } = Ember;
const { RSVP: { Promise } } = Ember;

export default function() {
  return new Promise((resolve) => {
    Ember.$(document).one('keyup.ae-step', (event) => {
      run(() => {
        if (event.which === 32 && event.ctrlKey && event.altKey && event.shiftKey) {
          resolve();
        }
      });
    });
  });
}
