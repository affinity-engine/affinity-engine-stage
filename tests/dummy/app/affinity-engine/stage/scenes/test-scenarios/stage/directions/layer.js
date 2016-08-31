import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Layer Direction Test',

  start: task(function * (script) {
    script.basic('First Basic Header');

    yield step();

    const metaLayer = yield script.layer('engine.meta').transition({ opacity: 0.5 });

    yield step();

    metaLayer.transition({ opacity: 0.3 });

    yield step();

    script.layer('engine.meta').transition({ padding: '123px' });

    yield step();

    script.layer('engine.meta').transition({ padding: '456px' }).transition({ margin: '789px' }).transition({ margin: '555px' });

    yield step();

    metaLayer.transition({ opacity: 0.5 });
  })
});
