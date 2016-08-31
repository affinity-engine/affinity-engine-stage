import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Scene Change 1',

  start: task(function * (script) {
    script.basic('Scene One');

    yield step();

    script.scene('test-scenarios/stage/directions/scene/2');
  })
});
