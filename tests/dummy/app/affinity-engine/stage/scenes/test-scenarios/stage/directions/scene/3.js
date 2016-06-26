import { Scene, step } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Scene Change 3',

  start: async function(script) {
    script.basic('Scene Three');

    await step();

    script.scene('test-scenarios/stage/directions/scene/5');
  }
});
