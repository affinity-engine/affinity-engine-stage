import { Scene, step } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Scene Change 1',

  start: async function(script) {
    script.basic('Scene One');

    await step();

    script.scene('test-scenarios/stage/directions/scene/2');
  }
});
