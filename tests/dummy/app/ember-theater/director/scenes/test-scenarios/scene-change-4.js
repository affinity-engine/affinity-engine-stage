import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 4',

  start: async function(script, window) {
    script.Basic('Scene Four');
  }
});
