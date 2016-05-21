import { Directable } from 'ember-theater-director';

export function initialize(appInstance) {
  appInstance.register('ember-theater/director:directable', Directable, { singleton: false, instantiate: false });
}

export default {
  name: 'ember-theater/director/register-directable',
  initialize
};
