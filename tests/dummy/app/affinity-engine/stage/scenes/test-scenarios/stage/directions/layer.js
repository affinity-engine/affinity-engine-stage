import { Scene, step } from 'affinity-engine-stage';

export default Scene.extend({
  name: 'Layer Direction Test',

  start: async function(script) {
    script.basic('First Basic Header');

    await step();

    script.layer('theater.meta').transition({ opacity: 0.5 });

    await step();

    script.layer('theater.meta').transition({ padding: '123px' });

    await step();

    script.layer('theater.meta').transition({ padding: '456px' }).transition({ margin: '789px' }).transition({ margin: '555px' });
  }
});
