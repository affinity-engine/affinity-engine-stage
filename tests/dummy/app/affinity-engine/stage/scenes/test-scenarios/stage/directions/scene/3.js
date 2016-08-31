import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Scene Change 3',

  start: task(function * (script) {
    script.basic('Scene Three');

    yield step();

    script.scene('test-scenarios/stage/directions/scene/5');
  })
});
