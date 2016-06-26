import { Scene } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Scene Change 4',

  start: async function(script) {
    script.basic('Scene Four');
  }
});
