import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 1',

  start: async function(script) {
    script.Basic('Scene One');

    await step();

    script.Scene('test-scenarios/director/directions/scene/2');
  }
});
