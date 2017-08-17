import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Layer Direction Test',

  start: task(function * (script) {
    script.basic('First Basic Header');

    yield step();

    const metaLayer = yield script.layer('engine.meta').transition({ effect: { opacity: 0.5 } });

    yield step();

    metaLayer.transition({ effect: { opacity: 0.3 } });

    yield step();

    yield metaLayer.transition({ effect: { padding: '456px' } }).transition({ effect: { opacity: 0.4 } }).transition({ effect: { opacity: 0.5 } });

    yield step();

    script.layer('engine.meta').transition({ effect: { padding: '123px' } });

    yield step();

    script.layer('engine.meta').transition({ effect: { padding: '450px' } }).transition({ effect: { margin: '789px' } }).transition({ effect: { margin: '555px' } });

    yield step();

    metaLayer.transition({ effect: { opacity: 0.3 } });
  })
});
