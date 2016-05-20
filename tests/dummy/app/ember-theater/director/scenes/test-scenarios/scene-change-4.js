import { Scene } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 4',

  start: async function(script) {
    script.Basic('Scene Four');
  }
});
