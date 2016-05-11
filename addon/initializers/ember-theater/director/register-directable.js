import { Directable } from 'ember-theater-director/ember-theater/director';

export function initialize(application) {
  application.register('directable:main', Directable, { singleton: false, instantiate: false });
}

export default {
  name: 'ember-theater/director/register-directable',
  initialize: initialize
};
