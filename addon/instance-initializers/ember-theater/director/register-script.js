import { Script } from 'ember-theater-director';

export function initialize(appInstance) {
  appInstance.register('script:main', Script, { singleton: false, instantiate: false });
}

export default {
  name: 'ember-theater/director/register-script',
  initialize
};
