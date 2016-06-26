import { Directable } from 'affinity-engine-stage';

export function initialize(appInstance) {
  appInstance.register('affinity-engine/stage:directable', Directable, { singleton: false, instantiate: false });
}

export default {
  name: 'affinity-engine/stage/register-directable',
  initialize
};
