import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Layer Direction Test',

  start: async function(script) {
    script.Basic('First Basic Header');

    await step();

    script.Layer('theater.meta').transition({ opacity: 0.5 });

    await step();

    script.Layer('theater.meta').transition({ padding: '123px' });

    await step();

    script.Layer('theater.meta').transition({ padding: '456px' }).transition({ margin: '789px' }).transition({ margin: '555px' });
  }
});
