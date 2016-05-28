import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 3',

  start: async function(script) {
    script.basic('Scene Three');

    await step();

    script.scene('test-scenarios/director/directions/scene/5');
  }
});
