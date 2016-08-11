import Ember from 'ember';

export default function(app, duration) {
  triggerEvent(document, 'keyup', {
    keyCode: 32,
    which: 32,
    altKey: true,
    ctrlKey: true,
    shiftKey: true
  });

  return delay(duration);
}
