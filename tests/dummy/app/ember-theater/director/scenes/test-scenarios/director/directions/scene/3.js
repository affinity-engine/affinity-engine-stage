import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 3',

  start: async function(script) {
    script.Basic('Scene Three');

    await step();

    script.Scene('test-scenarios/director/directions/scene/5');
  }
});
