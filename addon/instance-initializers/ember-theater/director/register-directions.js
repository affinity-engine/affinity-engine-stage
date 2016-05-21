import Ember from 'ember';
import gatherModules from 'ember-theater/utils/gather-modules';

const {
  get,
  getOwner
} = Ember;

const { String: { capitalize } } = Ember;

const injectDirectionProxy = function injectDirectionProxy(appInstance, name) {
  const proxy = function proxy(...args) {
    // the scene is the context here
    const factory = getOwner(this).lookup(`ember-theater/director/direction:${name}`);

    return get(this, 'director').direct(this, factory, args);
  };

  const constantizedName = name.split('-').map((section) => capitalize(section)).join('');

  appInstance.register(`ember-theater/director/direction:${name}-proxy`, proxy, { instantiate: false, singleton: false });
  appInstance.inject('ember-theater/director:script', constantizedName, `ember-theater/director/direction:${name}-proxy`);
};

export function initialize(appInstance) {
  const directions = gatherModules('ember-theater\/director\/directions');

  directions.forEach((direction, directionName) => {
    direction.type = directionName;
    appInstance.register(`ember-theater/director/direction:${directionName}`, direction, { instantiate: false, singleton: false });
    injectDirectionProxy(appInstance, directionName);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
