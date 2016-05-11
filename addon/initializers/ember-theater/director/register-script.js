import { Script } from 'ember-theater-director/ember-theater/director';

export function initialize(application) {
  application.register('script:main', Script, { singleton: false, instantiate: false });
}

export default {
  name: 'ember-theater/director/register-script',
  initialize: initialize
};
