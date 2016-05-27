import Ember from 'ember';
import { gatherTypes } from 'ember-theater';
import { Direction } from 'ember-theater-director';

const {
  assign,
  get
} = Ember;

const { String: { capitalize } } = Ember;

const extendToDirection = function extendToDirection(appInstance, { constantizedName, dasherizedNamed }) {
  const newContent = {};

  newContent[constantizedName] = function(...args) {
    // the direction is the context here
    const direction = this._createDirection(dasherizedNamed);
    const childPredecessors = { };

    childPredecessors[get(this, '_name')] = get(this, 'attrs');

    return direction._setup(...args, assign(childPredecessors, get(this, 'predecessors')));
  };

  Direction.reopen(newContent);
};

const applyName = function applyName(appInstance, { constantizedName, dasherizedNamed }) {
  const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

  factory.reopen({
    _name: constantizedName
  });
};

const injectDirectionProxy = function injectDirectionProxy(appInstance, { constantizedName, dasherizedNamed }) {
  const scriptProxy = function scriptProxy(...args) {
    // the scene is the context here
    const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

    return get(this, 'director').direct(this, factory, args);
  };

  appInstance.register(`ember-theater/director/direction/proxy/script:${dasherizedNamed}`, scriptProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script', constantizedName, `ember-theater/director/direction/proxy/script:${dasherizedNamed}`);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  gatherTypes(appInstance, 'ember-theater/director/direction').map((dasherizedNamed) => {
    const constantizedName = dasherizedNamed.split('-').map((section) => capitalize(section)).join('');
    const nameMap = { constantizedName, dasherizedNamed };

    extendToDirection(appInstance, nameMap);

    return nameMap;
  }).forEach((nameMap) => {
    // applyName must be called after all directions have been passed to `extendToDirection`
    // since once the factory is looked up, reopening it has no effect.
    applyName(appInstance, nameMap);
    injectDirectionProxy(appInstance, nameMap);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
