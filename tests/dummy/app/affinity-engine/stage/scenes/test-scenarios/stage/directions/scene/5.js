import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Scene Change 5',

  start: task(function * (script, data, state) {
    script.basic('Scene Five');

    yield step();

    state.window.close();
  })
});
