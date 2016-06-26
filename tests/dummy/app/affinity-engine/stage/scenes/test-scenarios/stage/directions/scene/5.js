import { Scene, step } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Scene Change 5',

  start: async function(script, window) {
    script.basic('Scene Five');

    await step();

    window.close();
  }
});
