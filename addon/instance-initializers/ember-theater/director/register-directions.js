import Ember from 'ember';
import { gatherTypes } from 'ember-theater-director';

const {
  get,
  getOwner
} = Ember;

const { String: { camelize } } = Ember;

const injectDirectionProxy = function injectDirectionProxy(appInstance, name) {
  const proxy = function proxy(...args) {
    // the scene is the context here
    const factory = getOwner(this).lookup(`ember-theater/director/direction:${name}`);

    return get(this, 'director').direct(this, factory, args);
  };

  const constantizedName = name.split('-').map((section) => camelize(section)).join('');

  appInstance.register(`ember-theater/director/direction:${name}-proxy`, proxy, { instantiate: false, singleton: false });
  appInstance.inject('ember-theater/director:script', constantizedName, `ember-theater/director/direction:${name}-proxy`);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  const directionNames = gatherTypes(appInstance, 'ember-theater/director/direction');

  directionNames.forEach((directionName) => {
    injectDirectionProxy(appInstance, directionName);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
