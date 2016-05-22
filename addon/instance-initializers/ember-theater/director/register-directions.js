import Ember from 'ember';
import { gatherTypes } from 'ember-theater';
import { Direction } from 'ember-theater-director';

const {
  assign,
  get
} = Ember;

const { String: { camelize } } = Ember;

const extendToDirection = function extendToDirection(appInstance, name) {
  const newContent = {};

  newContent[camelize(name)] = function(...args) {
    // the direction is the context here
    const direction = this._createDirection(name);
    const childPredecessors = { };

    childPredecessors[get(this, '_name')] = get(this, 'attrs');

    return direction._setup(...args, assign(childPredecessors, get(this, 'predecessors')));
  };

  Direction.reopen(newContent);
};

const applyName = function applyName(appInstance, name) {
  const factory = appInstance.lookup(`ember-theater/director/direction:${name}`);

  factory.reopen({
    _name: camelize(name)
  });
};

const injectDirectionProxy = function injectDirectionProxy(appInstance, name) {
  const scriptProxy = function scriptProxy(...args) {
    // the scene is the context here
    const factory = appInstance.lookup(`ember-theater/director/direction:${name}`);

    return get(this, 'director').direct(this, factory, args);
  };

  appInstance.register(`ember-theater/director/direction/proxy/script:${name}`, scriptProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script', camelize(name), `ember-theater/director/direction/proxy/script:${name}`);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  gatherTypes(appInstance, 'ember-theater/director/direction').map((directionName) => {
    extendToDirection(appInstance, directionName);

    return directionName;
  }).forEach((directionName) => {
    // applyName must be called after all directions have been passed to `extendToDirection`
    // since once the factory is looked up, reopening it has no effect.
    applyName(appInstance, directionName);
    injectDirectionProxy(appInstance, directionName);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
