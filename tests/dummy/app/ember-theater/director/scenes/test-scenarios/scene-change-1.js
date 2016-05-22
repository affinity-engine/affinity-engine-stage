import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 1',

  start: async function(script) {
    script.basic('Scene One');

    await step();

    script.scene('test-scenarios/scene-change-2');
  }
});
