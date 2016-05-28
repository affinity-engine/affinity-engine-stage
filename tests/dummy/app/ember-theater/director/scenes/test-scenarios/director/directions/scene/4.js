import { Scene } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 4',

  start: async function(script) {
    script.basic('Scene Four');
  }
});
