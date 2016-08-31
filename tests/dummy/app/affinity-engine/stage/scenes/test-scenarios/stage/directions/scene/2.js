import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Scene Change 2',

  start: task(function * (script) {
    script.basic('Scene Two');

    yield step();

    script.scene('test-scenarios/stage/directions/scene/3').window('simple-window').classNames('ae-center').priority(2);
    script.scene('test-scenarios/stage/directions/scene/4').window('window-with-screen').classNames('ae-center').screen('foo').priority(1);
  })
});
