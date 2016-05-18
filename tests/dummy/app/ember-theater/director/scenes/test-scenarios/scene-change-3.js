import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 3',

  start: async function(script, window) {
    script.Basic('Scene Three');

    await step();

    script.Scene('test-scenarios/scene-change-5');
  }
});
