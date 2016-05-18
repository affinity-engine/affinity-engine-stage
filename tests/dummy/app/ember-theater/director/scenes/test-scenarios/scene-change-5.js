import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 5',

  start: async function(script, window) {
    script.Basic('Scene Five');

    await step();

    window.close();
  }
});
