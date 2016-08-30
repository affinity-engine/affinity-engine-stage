import { Scene, step } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Layer Direction Test',

  start: async function(script) {
    script.basic('First Basic Header');

    await step();

    const metaLayer = script.layer('engine.meta').transition({ opacity: 0.5 });

    await step();

    metaLayer.transition({ opacity: 0.3 });

    await step();

    script.layer('engine.meta').transition({ padding: '123px' });

    await step();

    script.layer('engine.meta').transition({ padding: '456px' }).transition({ margin: '789px' }).transition({ margin: '555px' });
  }
});
